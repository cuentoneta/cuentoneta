/**
 * Smoke post-deploy de indexado: corre las invariantes de `seo-invariants` sobre el HTML SSR crudo
 * de un despliegue real (`BASE_URL`), reusando el MISMO core que el gate de e2e para no divergir.
 *
 * Uso:
 *   BASE_URL=https://www.cuentoneta.org pnpm seo:smoke
 *   SIMULATE_PROXY_HEADERS=true BASE_URL=... pnpm seo:smoke   # reproduce el x-forwarded-for de Vercel
 *
 * Herramienta manual de diagnóstico (no un gate de CI): reporta TODAS las violaciones por página y
 * sale con código 1 si hay alguna.
 */
import {
	collectIndexableHtmlViolations,
	type IndexableHtmlExpectations,
	type Violation,
} from '../e2e/_utils/seo-invariants';
import { STABLE_SLUGS, SCHEMA_IDS, SITEWIDE_SCHEMA_IDS } from '../e2e/_utils/seo-fixtures';

const BASE_URL = process.env['BASE_URL'] ?? 'http://localhost:4000';

// Mismo header y razonamiento que ssr-proxy-headers.spec.ts: Vercel agrega x-forwarded-for a toda
// request y dispara el deopt a CSR si no se confía. Se omite x-forwarded-proto a propósito para no
// forzar el self-fetch del SSR a https contra un BASE_URL en http local.
const proxyHeaders: Record<string, string> =
	process.env['SIMULATE_PROXY_HEADERS'] === 'true' ? { 'x-forwarded-for': '66.249.66.1' } : {};

const pages: readonly IndexableHtmlExpectations[] = [
	{
		path: '/home',
		titlePattern: /La Cuentoneta/,
		canonicalContains: 'cuentoneta',
		requiredJsonLdIds: SITEWIDE_SCHEMA_IDS,
	},
	{
		path: `/story/${STABLE_SLUGS.story}`,
		titlePattern: /aleph/i,
		h1Pattern: /aleph/i,
		requiredJsonLdIds: [...SITEWIDE_SCHEMA_IDS, SCHEMA_IDS.article, SCHEMA_IDS.breadcrumbStory],
		requiredInternalLinkPrefix: '/author/',
	},
	{
		path: `/author/${STABLE_SLUGS.author}`,
		titlePattern: /borges/i,
		requiredJsonLdIds: [...SITEWIDE_SCHEMA_IDS, SCHEMA_IDS.profilePage, SCHEMA_IDS.breadcrumbAuthor],
		requiredInternalLinkPrefix: '/story/',
	},
	{
		path: `/storylist/${STABLE_SLUGS.storylist}`,
		requiredJsonLdIds: [...SITEWIDE_SCHEMA_IDS, SCHEMA_IDS.collection, SCHEMA_IDS.breadcrumbStorylist],
		requiredInternalLinkPrefix: '/story/',
	},
];

async function fetchViolations(
	expectations: IndexableHtmlExpectations,
): Promise<{ status: number; violations: Violation[] }> {
	const response = await fetch(`${BASE_URL}${expectations.path}`, { headers: proxyHeaders });
	return { status: response.status, violations: collectIndexableHtmlViolations(await response.text(), expectations) };
}

async function report(expectations: IndexableHtmlExpectations): Promise<boolean> {
	try {
		const { status, violations } = await fetchViolations(expectations);
		if (violations.length === 0) {
			console.log(`✅ ${expectations.path} (${status})`);
			return false;
		}
		console.log(`❌ ${expectations.path} (${status})`);
		violations.forEach((violation) => console.log(`     - [${violation.rule}] ${violation.message}`));
		return true;
	} catch (error) {
		console.log(`❌ ${expectations.path} — fetch falló: ${error instanceof Error ? error.message : String(error)}`);
		return true;
	}
}

async function run(): Promise<void> {
	console.log(
		`Smoke de indexado contra ${BASE_URL}${proxyHeaders['x-forwarded-for'] ? ' (con x-forwarded-for)' : ''}\n`,
	);
	let failed = false;
	for (const expectations of pages) {
		failed = (await report(expectations)) || failed;
	}
	if (failed) {
		process.exitCode = 1;
	}
}

void run();
