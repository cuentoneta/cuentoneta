/**
 * Smoke post-deploy de indexado: corre las invariantes de `seo-invariants` sobre el HTML SSR crudo
 * de un despliegue real (`BASE_URL`), reusando el MISMO core que el gate de e2e para no divergir.
 *
 * Cobertura: siempre chequea `/home` + los slugs estables conocidos-buenos (baseline de regresión),
 * y además una muestra ALEATORIA de cuentos/autores/colecciones tomada del `/sitemap.xml` en cada
 * corrida (cobertura rotativa). Los patrones de `<title>`/`<h1>` se derivan del slug de cada URL.
 * Si el sitemap no está disponible, el baseline igual se ejerce (la muestra se omite con un aviso).
 *
 * Uso:
 *   BASE_URL=https://www.cuentoneta.ar pnpm seo:smoke
 *   SEO_SMOKE_SAMPLE=5 pnpm seo:smoke                            # N aleatorios por tipo (default 3)
 *   SEO_SMOKE_SLUGS=/story/el-aleph,/author/... pnpm seo:smoke   # reproduce paths puntuales (sin muestra)
 *   pnpm seo:smoke --full   (o SEO_SMOKE_FULL=true)              # recorre TODO el sitemap (lento)
 *   SIMULATE_PROXY_HEADERS=true pnpm seo:smoke                   # reproduce el x-forwarded-for de Vercel
 *
 * Herramienta manual de diagnóstico (no un gate de CI): reporta TODAS las violaciones por página,
 * loguea los paths chequeados (para reproducir) y sale con código 1 si hay alguna.
 */
import { collectIndexableHtmlViolations, type IndexableHtmlExpectations } from '../e2e/_utils/seo-invariants';
import { STABLE_SLUGS, SITEWIDE_SCHEMA_IDS } from '../e2e/_utils/seo-fixtures';
import { expectationsFor, parseSitemap, selectByType } from './seo-smoke.helpers';

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
		const violations = collectIndexableHtmlViolations(await response.text(), expectations);
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

async function sampledPaths(baseline: readonly string[]): Promise<string[]> {
	const response = await fetch(`${BASE_URL}/sitemap.xml`, { headers: proxyHeaders });
	if (!response.ok) {
		throw new Error(`GET /sitemap.xml devolvió HTTP ${response.status}`);
	}
	const paths = parseSitemap(await response.text());
	const excluded = new Set(baseline);
	return ['/story/', '/author/', '/storylist/']
		.flatMap((prefix) => selectByType(paths, prefix, SAMPLE_SIZE, FULL))
		.filter((path) => !excluded.has(path));
}

async function run(): Promise<void> {
	console.log(
		`Smoke de indexado contra ${BASE_URL}${proxyHeaders['x-forwarded-for'] ? ' (con x-forwarded-for)' : ''}\n`,
	);

	// El baseline no depende del sitemap: se ejerce siempre.
	const baseline =
		SLUGS_OVERRIDE.length > 0
			? SLUGS_OVERRIDE
			: [`/story/${STABLE_SLUGS.story}`, `/author/${STABLE_SLUGS.author}`, `/storylist/${STABLE_SLUGS.storylist}`];
	console.log(`Baseline: /home\n  ${baseline.join('\n  ')}\n`);
	let failed = await reportExpectations(HOME_EXPECTATIONS);
	for (const path of baseline) {
		failed = (await reportPath(path)) || failed;
	}

	// La muestra sí depende del sitemap: su falla se reporta pero NO tumba el baseline.
	if (SLUGS_OVERRIDE.length === 0) {
		try {
			const sample = await sampledPaths(baseline);
			console.log(`\nMuestra del sitemap (${FULL ? 'full' : `${SAMPLE_SIZE}/tipo`}):\n  ${sample.join('\n  ')}\n`);
			for (const path of sample) {
				failed = (await reportPath(path)) || failed;
			}
		} catch (error) {
			console.log(`⚠️ sitemap no disponible, se omite la muestra aleatoria: ${messageOf(error)}`);
			failed = true;
		}
	}

	if (failed) {
		process.exitCode = 1;
	}
}

run().catch((error: unknown) => {
	console.error(error);
	process.exitCode = 1;
});
