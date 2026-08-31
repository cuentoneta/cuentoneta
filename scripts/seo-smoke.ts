/**
 * Smoke post-deploy de indexado: corre las invariantes de `seo-invariants` sobre el HTML SSR crudo
 * de un despliegue real (`BASE_URL`), reusando el MISMO core que el gate de e2e para no divergir.
 *
 * Cobertura: siempre chequea `/home` + los slugs estables conocidos-buenos (baseline de regresión),
 * y además una muestra ALEATORIA de obras/autores/colecciones tomada del `/sitemap.xml` en cada
 * corrida (cobertura rotativa). Los patrones de `<title>`/`<h1>` se derivan del slug de cada URL.
 * Si el sitemap no está disponible, el baseline igual se ejerce (la muestra se omite con un aviso).
 *
 * Del propio `/sitemap.xml` chequea además la secuencia de elementos que exige su esquema y la
 * dispersión del `lastmod`: una fecha repetida en medio corpus delata una escritura en lote, y eso
 * solo se ve contra el corpus real de un despliegue.
 *
 * Uso:
 *   BASE_URL=https://www.cuentoneta.ar pnpm seo:smoke
 *   SEO_SMOKE_SAMPLE=5 pnpm seo:smoke                            # N aleatorios por tipo (default 3)
 *   SEO_SMOKE_SLUGS=/literary-work/el-fin,/author/... pnpm seo:smoke      # reproduce paths puntuales (sin muestra)
 *   pnpm seo:smoke --full   (o SEO_SMOKE_FULL=true)              # recorre TODO el sitemap (lento)
 *   SIMULATE_PROXY_HEADERS=true pnpm seo:smoke                   # reproduce el x-forwarded-for de Vercel
 *
 * Herramienta manual de diagnóstico (no un gate de CI): reporta TODAS las violaciones por página,
 * loguea los paths chequeados (para reproducir) y sale con código 1 si hay alguna.
 */
import { collectIndexableHtmlViolations, type IndexableHtmlExpectations } from '../e2e/_utils/seo-invariants';
import { STABLE_SLUGS, SITEWIDE_SCHEMA_IDS } from '../e2e/_utils/seo-fixtures';
import {
	checkSitewideAbsoluteUrls,
	collectSitemapViolations,
	expectationsFor,
	parseSitemap,
	selectByType,
} from './seo-smoke.helpers';

const BASE_URL = process.env['BASE_URL'] ?? 'http://localhost:4000';
const FULL = process.argv.includes('--full') || process.env['SEO_SMOKE_FULL'] === 'true';
const SLUGS_OVERRIDE = (process.env['SEO_SMOKE_SLUGS'] ?? '')
	.split(',')
	.map((path) => path.trim())
	.filter(Boolean);
const SAMPLE_SIZE = resolveSampleSize(process.env['SEO_SMOKE_SAMPLE']);

// Mismo header y razonamiento que ssr-proxy-headers.spec.ts: Vercel agrega x-forwarded-for a toda
// request y dispara el deopt a CSR si no se confía. Se omite x-forwarded-proto a propósito para no
// forzar el self-fetch del SSR a https contra un BASE_URL en http local.
const proxyHeaders: Record<string, string> =
	process.env['SIMULATE_PROXY_HEADERS'] === 'true' ? { 'x-forwarded-for': '66.249.66.1' } : {};

const HOME_EXPECTATIONS: IndexableHtmlExpectations = {
	path: '/home',
	titlePattern: /La Cuentoneta/,
	canonicalContains: 'cuentoneta',
	requiredJsonLdIds: SITEWIDE_SCHEMA_IDS,
};

function resolveSampleSize(raw: string | undefined): number {
	if (raw === undefined) {
		return 3;
	}
	const size = Number(raw);
	if (Number.isInteger(size) && size > 0) {
		return size;
	}
	console.log(`⚠️ SEO_SMOKE_SAMPLE="${raw}" no es un entero positivo; usando el default 3.`);
	return 3;
}

function messageOf(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

async function reportExpectations(expectations: IndexableHtmlExpectations): Promise<boolean> {
	try {
		const response = await fetch(`${BASE_URL}${expectations.path}`, { headers: proxyHeaders });
		const html = await response.text();
		const violations = [
			...(await collectIndexableHtmlViolations(html, expectations)),
			...checkSitewideAbsoluteUrls(html).map((message) => ({ rule: 'sitewide-url', message })),
		];
		if (violations.length === 0) {
			console.log(`✅ ${expectations.path} (${response.status})`);
			return false;
		}
		console.log(`❌ ${expectations.path} (${response.status})`);
		violations.forEach((violation) => console.log(`     - [${violation.rule}] ${violation.message}`));
		return true;
	} catch (error) {
		console.log(`❌ ${expectations.path} — fetch falló: ${messageOf(error)}`);
		return true;
	}
}

// Construye las expectations (incluye el `new RegExp` del patrón por slug) y reporta, todo dentro de
// un try por-página: un slug problemático solo invalida su propio reporte, no aborta la corrida.
async function reportPath(path: string): Promise<boolean> {
	let expectations: IndexableHtmlExpectations | null;
	try {
		expectations = expectationsFor(path);
	} catch (error) {
		console.log(`❌ ${path} — no se pudo construir las expectations: ${messageOf(error)}`);
		return true;
	}
	return expectations ? reportExpectations(expectations) : false;
}

// El documento del sitemap se reporta con la misma descarga que alimenta la muestra: pedirlo dos
// veces daría dos versiones distintas si el caché de borde expira en el medio.
function reportSitemapDocument(xml: string): boolean {
	const report = collectSitemapViolations(xml);
	const cluster = report.largestCluster;
	const clusterLabel = cluster ? `, mayor concentración ${Math.round(cluster.share * 100)}% en ${cluster.date}` : '';

	console.log(
		`\nSitemap: ${report.urls} URLs, ${report.dated} con fecha, ${report.distinctDates} fechas distintas${clusterLabel}`,
	);
	if (report.violations.length === 0) {
		console.log('✅ /sitemap.xml');
		return false;
	}
	console.log('❌ /sitemap.xml');
	report.violations.forEach((violation) => console.log(`     - ${violation}`));
	return true;
}

function sampledPaths(baseline: readonly string[], xml: string): string[] {
	const paths = parseSitemap(xml);
	const excluded = new Set(baseline);
	return ['/author/', '/collection/', '/literary-work/']
		.flatMap((prefix) => selectByType(paths, prefix, SAMPLE_SIZE, FULL))
		.filter((path) => !excluded.has(path));
}

/** El baseline no depende del sitemap: se ejerce siempre. Devuelve si alguna ruta falló. */
async function reportBaseline(baseline: readonly string[]): Promise<boolean> {
	console.log(`Baseline: /home\n  ${baseline.join('\n  ')}\n`);
	let failed = await reportExpectations(HOME_EXPECTATIONS);
	for (const path of baseline) {
		failed = (await reportPath(path)) || failed;
	}
	return failed;
}

/**
 * Reporta el documento del sitemap y las páginas que muestrea de él. Todo esto depende del sitemap,
 * así que su falla se reporta pero **no** tumba el baseline: que el sitemap no esté disponible no
 * dice nada sobre las rutas que ya se ejercieron.
 */
async function reportSitemap(baseline: readonly string[]): Promise<boolean> {
	try {
		const response = await fetch(`${BASE_URL}/sitemap.xml`, { headers: proxyHeaders });
		if (!response.ok) {
			throw new Error(`GET /sitemap.xml devolvió HTTP ${response.status}`);
		}
		const xml = await response.text();

		let failed = reportSitemapDocument(xml);
		const sample = sampledPaths(baseline, xml);
		console.log(`\nMuestra del sitemap (${FULL ? 'full' : `${SAMPLE_SIZE}/tipo`}):\n  ${sample.join('\n  ')}\n`);
		for (const path of sample) {
			failed = (await reportPath(path)) || failed;
		}
		return failed;
	} catch (error) {
		console.log(`⚠️ sitemap no disponible, se omiten sus chequeos y la muestra aleatoria: ${messageOf(error)}`);
		return true;
	}
}

async function run(): Promise<void> {
	console.log(
		`Smoke de indexado contra ${BASE_URL}${proxyHeaders['x-forwarded-for'] ? ' (con x-forwarded-for)' : ''}\n`,
	);

	const baseline =
		SLUGS_OVERRIDE.length > 0
			? SLUGS_OVERRIDE
			: [
					`/author/${STABLE_SLUGS.author}`,
					`/collection/${STABLE_SLUGS.collection}`,
					`/literary-work/${STABLE_SLUGS.literaryWork}`,
				];

	let failed = await reportBaseline(baseline);
	// Con slugs explícitos no hay muestra que tomar: el llamador ya dijo qué quiere ejercer.
	if (SLUGS_OVERRIDE.length === 0) {
		failed = (await reportSitemap(baseline)) || failed;
	}

	if (failed) {
		process.exitCode = 1;
	}
}

run().catch((error: unknown) => {
	console.error(error);
	process.exitCode = 1;
});
