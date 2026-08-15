/**
 * Estado de indexado real de las URLs del sitio, vía la URL Inspection API de Search Console.
 *
 * Contesta lo que la pantalla de "Validación" de Search Console NO expone: por cada URL, si Google
 * la rastreó alguna vez (`lastCrawlTime`), si la indexó (`verdict`) y con qué canónica se quedó.
 * No existe API para iniciar ni consultar una validación, ni para "Solicitar indexación": inspeccionar
 * URL por URL es la única vía programática de medir el avance.
 *
 * Persiste en `tmp/seo-index-status/` (gitignoreado, salvo que `--history` diga otra cosa) un
 * historial POR URL, no una foto por corrida:
 * cada corrida actualiza las URLs que miró y deja intacto el resto, así inspeccionar un subconjunto
 * distinto no pisa lo medido antes. El dato útil es la serie ("cuántas pasaron a indexada"), y el
 * reporte la expone diffeando contra la observación anterior de cada URL.
 *
 * La API devuelve errores transitorios de forma esporádica, así que una inspección que erra se
 * reintenta con backoff —solo si el error puede no ser determinista, y sin saltear el espaciado de
 * despacho—. La que agota sus intentos se reporta como fallida: una inspección que no ocurrió no
 * debe reportarse como si hubiera ocurrido.
 *
 * El código de salida transporta la CAUSA, no solo la existencia de un fallo, porque quien corre
 * esto sin mirar el log es un job programado y necesita decidir si pintarse de rojo:
 *   0  la corrida midió todo lo que se propuso;
 *   1  la herramienta no pudo medir (credenciales, permisos, cuota, o ni una sola observación);
 *   2  midió, y algunas inspecciones sueltas erraron por causas transitorias.
 *
 * Requisitos (una service account con acceso de lectura a la propiedad):
 *   1. Crear la service account en Google Cloud y habilitarle la Search Console API.
 *   2. En Search Console → Configuración → Usuarios y permisos, agregar su `client_email` con
 *      permiso "Full" (alcanza lectura; "Propietario" solo hace falta para escribir).
 *   3. Exportar la key y apuntarle con GSC_SERVICE_ACCOUNT_KEY_PATH (o pegar el JSON en
 *      GSC_SERVICE_ACCOUNT_KEY, preferible en CI para que la key no toque disco).
 *      Guardarla FUERA del árbol del repo: el nombre con que se exporta depende del proyecto, así
 *      que los patrones del .gitignore son una red de contención y no una garantía. Si conviene
 *      tenerla cerca, `.secrets/` está ignorado.
 *
 * Uso:
 *   GSC_SITE_URL=sc-domain:cuentoneta.ar pnpm seo:index-status              # muestrea el sitemap
 *   ... pnpm seo:index-status --urls=ruta/a/urls.txt                        # una URL por línea
 *   ... pnpm seo:index-status --all                                         # todo el sitemap (ojo cuota)
 *   ... pnpm seo:index-status --sample=50
 *   ... pnpm seo:index-status --history=ruta/a/latest.json               # dónde vive la serie
 *   ... pnpm seo:index-status --summary="$GITHUB_STEP_SUMMARY"           # resumen en Markdown
 *   GSC_SERVICE_ACCOUNT_KEY_PATH=... pnpm seo:index-status --list-sites   # ver el siteUrl exacto
 */
import { appendFile, readFile, writeFile, mkdir } from 'node:fs/promises';
// La auth se toma del propio cliente, no de `google-auth-library` como dependencia aparte: el objeto
// que construye cruza la frontera entre ambos paquetes, y dos instancias distintas —lo que pasa
// apenas los rangos dejan de coincidir— el compilador las trata como tipos ajenos.
import { auth, searchconsole } from '@googleapis/searchconsole';
import {
	classify,
	classifyRunOutcome,
	createPacer,
	EXIT_CODE,
	mergeSnapshot,
	messageOf,
	parseSampleSize,
	parseSitemapLocs,
	resolveHistoryPaths,
	snapshotOf,
	storedRows,
	toSnapshot,
	type ClassifiedRow,
	type InspectionSnapshot,
	type SnapshotStore,
} from './seo-index-status.helpers';
import { formatReport, formatSummaryMarkdown, type SummaryInput } from './seo-index-status.report';
import { createRetryBudget, runWithRetries } from './seo-index-status.retry';

const SITE_URL = process.env['GSC_SITE_URL'] ?? '';
const BASE_URL = process.env['BASE_URL'] ?? 'https://www.cuentoneta.ar';
const KEY_PATH = process.env['GSC_SERVICE_ACCOUNT_KEY_PATH'];
const INLINE_KEY = process.env['GSC_SERVICE_ACCOUNT_KEY'];

const URLS_FILE = argValue('--urls');
const SAMPLE_SIZE = parseSampleSize(argValue('--sample'));
const ALL = process.argv.includes('--all');
const LIST_SITES = process.argv.includes('--list-sites');

// Cuota oficial por propiedad: 2.000 consultas/día y 600/minuto.
const QUOTA_PER_DAY = 2000;
const QUOTA_PER_MINUTE = 600;
const MS_PER_MINUTE = 60_000;
// Se despacha al 80% del techo por minuto: el margen es lo que absorbe los reintentos, que compiten
// por ranura como cualquier otro despacho. El cliente HTTP no aporta ninguno — su reintento propio
// cubre métodos idempotentes, y esta inspección es un POST.
const DISPATCH_SPACING_MS = Math.ceil(MS_PER_MINUTE / (QUOTA_PER_MINUTE * 0.8));
const CONCURRENCY = 8;

function argValue(flag: string): string | undefined {
	const found = process.argv.find((arg) => arg.startsWith(`${flag}=`));
	return found?.slice(flag.length + 1);
}

const HISTORY = resolveHistoryPaths(argValue('--history'));
const SUMMARY_FILE = argValue('--summary');

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildAuth(): InstanceType<typeof auth.GoogleAuth> {
	const scopes = ['https://www.googleapis.com/auth/webmasters.readonly'];
	if (INLINE_KEY) {
		try {
			return new auth.GoogleAuth({ credentials: JSON.parse(INLINE_KEY), scopes });
		} catch (error) {
			throw new Error('GSC_SERVICE_ACCOUNT_KEY no contiene un JSON válido.', { cause: error });
		}
	}
	// Sin keyFile, GoogleAuth cae a GOOGLE_APPLICATION_CREDENTIALS / credenciales del entorno.
	return new auth.GoogleAuth({ keyFile: KEY_PATH, scopes });
}

async function resolveUrls(): Promise<string[]> {
	if (URLS_FILE) {
		const contents = await readFile(URLS_FILE, 'utf8');
		return contents
			.split('\n')
			.map((line) => line.trim())
			.filter((line) => line.length > 0 && !line.startsWith('#'));
	}

	const response = await fetch(`${BASE_URL}/sitemap.xml`);
	if (!response.ok) {
		throw new Error(`GET /sitemap.xml devolvió HTTP ${response.status}`);
	}
	const locs = parseSitemapLocs(await response.text());
	return ALL ? locs : locs.slice(0, SAMPLE_SIZE);
}

type Inspector = (url: string) => Promise<InspectionSnapshot>;

function buildInspector(): Inspector {
	const api = searchconsole({ version: 'v1', auth: buildAuth() });

	// Propaga el error en vez de traducirlo acá: quien decide si se reintenta necesita el error tal
	// como vino, y la fila fallida se arma una sola vez, donde ya se sabe cuántos intentos costó.
	return async (url: string): Promise<InspectionSnapshot> => {
		const { data } = await api.urlInspection.index.inspect({
			// `languageCode: 'en'` fija el idioma de `coverageState`, que la API devuelve
			// LOCALIZADO: sin fijarlo, el texto cambia y los diffs entre corridas se ensucian.
			requestBody: { siteUrl: SITE_URL, inspectionUrl: url, languageCode: 'en' },
		});
		return toSnapshot(url, data.inspectionResult?.indexStatusResult ?? undefined);
	};
}

interface InspectionRun {
	rows: ClassifiedRow[];
	retries: number;
}

async function inspectAll(urls: readonly string[], inspect: Inspector): Promise<InspectionRun> {
	const rows: ClassifiedRow[] = [];
	const pace = createPacer(DISPATCH_SPACING_MS, { now: () => Date.now(), sleep: delay });
	const budget = createRetryBudget(QUOTA_PER_DAY - urls.length);
	let next = 0;

	async function worker(): Promise<void> {
		for (let index = next++; index < urls.length; index = next++) {
			const url = urls[index];
			if (url === undefined) {
				return;
			}
			const result = await runWithRetries(() => inspect(url), { pace, sleep: delay, budget });
			rows.push(classify(snapshotOf(url, result)));
			if (rows.length % 25 === 0 || rows.length === urls.length) {
				console.log(`  ... ${rows.length}/${urls.length}`);
			}
		}
	}

	await Promise.all(Array.from({ length: Math.min(CONCURRENCY, urls.length) }, worker));
	return { rows, retries: budget.consumed() };
}

/**
 * Solo la ausencia del archivo significa "primera corrida". Un archivo ilegible se propaga en vez de
 * degradarse a historial vacío: la corrida seguiría bien y `writeStore` sobrescribiría con lo que
 * midió, borrando en silencio la serie acumulada, que es todo el valor de la herramienta.
 */
async function readStore(): Promise<SnapshotStore> {
	let contents: string;
	try {
		contents = await readFile(HISTORY.file, 'utf8');
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			return {};
		}
		throw error;
	}

	try {
		return JSON.parse(contents) as SnapshotStore;
	} catch (error) {
		throw new Error(
			`${HISTORY.file} existe pero no es JSON válido. Movelo o borralo para empezar una serie nueva; ` +
				'sobrescribirlo perdería el historial acumulado.',
			{ cause: error },
		);
	}
}

async function writeStore(store: SnapshotStore, rows: readonly ClassifiedRow[], checkedAt: string): Promise<void> {
	const merged = mergeSnapshot(store, rows, checkedAt);
	await mkdir(HISTORY.dir, { recursive: true });
	await writeFile(HISTORY.file, JSON.stringify(merged, null, 2), 'utf8');
	console.log(`\nHistorial actualizado en ${HISTORY.file} (${Object.keys(merged).length} URL(s) conocidas)`);
}

/**
 * Appendea, no sobrescribe: el destino es de quien lo pasó por flag, no de la herramienta, y truncar
 * un archivo ajeno se lleva puesto lo que ya hubiera escrito.
 *
 * Un resumen que no se puede escribir no aborta la corrida. Es superficie de lectura, y perder la
 * medición ya hecha por no poder contarla sería el peor de los dos desenlaces.
 */
async function writeSummary(input: SummaryInput): Promise<void> {
	if (!SUMMARY_FILE) {
		return;
	}
	try {
		await appendFile(SUMMARY_FILE, `${formatSummaryMarkdown(input).join('\n')}\n`, 'utf8');
	} catch (error) {
		console.error(`No se pudo escribir el resumen en ${SUMMARY_FILE}: ${messageOf(error)}`);
	}
}

// La key la exigen las dos rutas; el siteUrl NO lo exige `--list-sites`, que existe justamente para
// averiguarlo. Ambos se validan ANTES de tocar la red, para no gastar una descarga del sitemap en una
// corrida que igual va a abortar.
function assertKey(): void {
	if (!KEY_PATH && !INLINE_KEY && !process.env['GOOGLE_APPLICATION_CREDENTIALS']) {
		throw new Error('Faltan credenciales: definí GSC_SERVICE_ACCOUNT_KEY_PATH o GSC_SERVICE_ACCOUNT_KEY.');
	}
}

function assertSiteUrl(): void {
	if (!SITE_URL) {
		throw new Error(
			'Falta GSC_SITE_URL (p. ej. "sc-domain:cuentoneta.ar" o "https://www.cuentoneta.ar/").\n' +
				'Corré `pnpm seo:index-status --list-sites` para ver el valor exacto de tus propiedades.',
		);
	}
}

function assertWithinQuota(urls: readonly string[]): void {
	if (urls.length > QUOTA_PER_DAY) {
		throw new Error(
			`${urls.length} URLs exceden la cuota diaria de ${QUOTA_PER_DAY} por propiedad. ` +
				`Acotá con --sample=N o --urls=archivo.`,
		);
	}
}

/**
 * `siteUrl` tiene que coincidir EXACTO con el alta de la propiedad ("sc-domain:cuentoneta.ar" para una
 * propiedad de dominio, "https://www.cuentoneta.ar/" —con barra final— para una de prefijo de URL).
 * Cualquier otra cosa da 403, sin pista de cuál era la correcta: esto las lista para no adivinar.
 */
async function listSites(): Promise<void> {
	const api = searchconsole({ version: 'v1', auth: buildAuth() });
	const { data } = await api.sites.list({});
	const entries = data.siteEntry ?? [];

	if (entries.length === 0) {
		console.log(
			'La service account no tiene ninguna propiedad asignada.\n' +
				'Agregá su client_email en Search Console → Settings → Users and permissions.',
		);
		return;
	}
	console.log('Propiedades visibles para esta service account (usá el valor tal cual en GSC_SITE_URL):\n');
	for (const entry of entries) {
		console.log(`  ${entry.siteUrl}   [${entry.permissionLevel}]`);
	}
}

async function run(): Promise<void> {
	assertKey();
	if (LIST_SITES) {
		await listSites();
		return;
	}

	assertSiteUrl();
	const urls = await resolveUrls();
	assertWithinQuota(urls);

	console.log(`Inspeccionando ${urls.length} URL(s) de ${SITE_URL} (~${DISPATCH_SPACING_MS}ms entre llamadas)\n`);
	const store = await readStore();
	const known = storedRows(store);
	const { rows, retries } = await inspectAll(urls, buildInspector());

	const report = { rows, previous: known.length > 0 ? known : undefined, retries };
	const checkedAt = new Date().toISOString();

	console.log(formatReport(report).join('\n'));
	await writeSummary({ ...report, checkedAt });
	await writeStore(store, rows, checkedAt);

	process.exitCode = classifyRunOutcome(rows);
}

run().catch((error: unknown) => {
	console.error(messageOf(error));
	process.exitCode = EXIT_CODE.toolFailure;
});
