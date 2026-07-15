/**
 * Smoke post-deploy de indexado: corre las invariantes de `seo-invariants` sobre el HTML SSR crudo
 * de un despliegue real (`BASE_URL`), reusando el MISMO core que el gate de e2e para no divergir.
 *
 * Cobertura: siempre chequea `/home` + los slugs estables conocidos-buenos (baseline de regresión),
 * y además una muestra ALEATORIA de cuentos/autores/colecciones tomada del `/sitemap.xml` en cada
 * corrida (cobertura rotativa). Los patrones de `<title>`/`<h1>` se derivan del slug de cada URL.
 *
 * Uso:
 *   BASE_URL=https://www.cuentoneta.ar pnpm seo:smoke
 *   SEO_SMOKE_SAMPLE=5 pnpm seo:smoke                     # N aleatorios por tipo (default 3)
 *   SEO_SMOKE_SLUGS=/story/el-aleph,/author/... pnpm seo:smoke   # reproduce paths puntuales
 *   pnpm seo:smoke --full                                 # recorre TODO el sitemap (lento)
 *   SIMULATE_PROXY_HEADERS=true pnpm seo:smoke            # reproduce el x-forwarded-for de Vercel
 *
 * Herramienta manual de diagnóstico (no un gate de CI): reporta TODAS las violaciones por página,
 * loguea los slugs muestreados (para reproducir) y sale con código 1 si hay alguna.
 */
import { parseHtml } from '../e2e/_utils/seo';
import {
	collectIndexableHtmlViolations,
	type IndexableHtmlExpectations,
	type Violation,
} from '../e2e/_utils/seo-invariants';
import { STABLE_SLUGS, SCHEMA_IDS, SITEWIDE_SCHEMA_IDS } from '../e2e/_utils/seo-fixtures';

const BASE_URL = process.env['BASE_URL'] ?? 'http://localhost:4000';
const SAMPLE_SIZE = Number(process.env['SEO_SMOKE_SAMPLE'] ?? '3');
const FULL = process.argv.includes('--full') || process.env['SEO_SMOKE_FULL'] === 'true';
const SLUGS_OVERRIDE = (process.env['SEO_SMOKE_SLUGS'] ?? '')
	.split(',')
	.map((path) => path.trim())
	.filter(Boolean);

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

// Vocales/consonantes que el slugify de Sanity aplana: el título conserva el acento/ñ, el slug no.
const LETTER_VARIANTS: Record<string, string> = {
	a: 'aáàäâ',
	e: 'eéèëê',
	i: 'iíìïî',
	o: 'oóòöô',
	u: 'uúùüû',
	n: 'nñ',
	c: 'cç',
};

function slugOf(path: string): string {
	return path.split('/').filter(Boolean).pop() ?? '';
}

// Deriva un patrón tolerante del slug: matchea (accent-insensitive) el token más distintivo (el más
// largo), lo bastante robusto ante sufijos de desambiguación (`-2`) y stopwords cortas.
function slugToTitlePattern(slug: string): RegExp {
	const token =
		[
			...slug
				.toLowerCase()
				.split('-')
				.filter((word) => /[a-z]/.test(word)),
		].sort((a, b) => b.length - a.length)[0] ?? slug;
	const body = [...token].map((char) => (LETTER_VARIANTS[char] ? `[${LETTER_VARIANTS[char]}]` : char)).join('');
	return new RegExp(body, 'i');
}

function expectationsFor(path: string): IndexableHtmlExpectations | null {
	if (path.startsWith('/story/')) {
		const pattern = slugToTitlePattern(slugOf(path));
		return {
			path,
			canonicalContains: path,
			titlePattern: pattern,
			h1Pattern: pattern,
			requiredJsonLdIds: [...SITEWIDE_SCHEMA_IDS, SCHEMA_IDS.article, SCHEMA_IDS.breadcrumbStory],
			requiredInternalLinkPrefix: '/author/',
		};
	}
	if (path.startsWith('/author/')) {
		return {
			path,
			canonicalContains: path,
			titlePattern: slugToTitlePattern(slugOf(path)),
			requiredJsonLdIds: [...SITEWIDE_SCHEMA_IDS, SCHEMA_IDS.profilePage, SCHEMA_IDS.breadcrumbAuthor],
			requiredInternalLinkPrefix: '/story/',
		};
	}
	if (path.startsWith('/storylist/')) {
		// El título de la storylist es editorial (no deriva del slug); sin titlePattern/h1Pattern.
		return {
			path,
			canonicalContains: path,
			requiredJsonLdIds: [...SITEWIDE_SCHEMA_IDS, SCHEMA_IDS.collection, SCHEMA_IDS.breadcrumbStorylist],
			requiredInternalLinkPrefix: '/story/',
		};
	}
	return null;
}

function toPath(loc: string): string | null {
	try {
		return new URL(loc.trim()).pathname;
	} catch {
		return null;
	}
}

async function sitemapPaths(): Promise<string[]> {
	const response = await fetch(`${BASE_URL}/sitemap.xml`, { headers: proxyHeaders });
	if (!response.ok) {
		throw new Error(`GET /sitemap.xml devolvió HTTP ${response.status}`);
	}
	return parseHtml(await response.text())
		.querySelectorAll('loc')
		.map((element) => toPath(element.text))
		.filter((path): path is string => path !== null);
}

function sample(paths: readonly string[], size: number): string[] {
	const pool = [...paths];
	const picked: string[] = [];
	while (picked.length < size && pool.length > 0) {
		const [chosen] = pool.splice(Math.floor(Math.random() * pool.length), 1);
		picked.push(chosen);
	}
	return picked;
}

function selectByType(paths: string[], prefix: string): string[] {
	const ofType = paths.filter((path) => path.startsWith(prefix));
	return FULL ? ofType : sample(ofType, SAMPLE_SIZE);
}

async function targetPaths(): Promise<string[]> {
	if (SLUGS_OVERRIDE.length > 0) {
		return SLUGS_OVERRIDE;
	}
	const paths = await sitemapPaths();
	const baseline = [
		`/story/${STABLE_SLUGS.story}`,
		`/author/${STABLE_SLUGS.author}`,
		`/storylist/${STABLE_SLUGS.storylist}`,
	];
	const sampled = ['/story/', '/author/', '/storylist/'].flatMap((prefix) => selectByType(paths, prefix));
	return [...new Set([...baseline, ...sampled])];
}

async function report(expectations: IndexableHtmlExpectations): Promise<boolean> {
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
		console.log(`❌ ${expectations.path} — fetch falló: ${error instanceof Error ? error.message : String(error)}`);
		return true;
	}
}

async function run(): Promise<void> {
	console.log(
		`Smoke de indexado contra ${BASE_URL}${proxyHeaders['x-forwarded-for'] ? ' (con x-forwarded-for)' : ''}\n`,
	);

	let paths: string[];
	try {
		paths = await targetPaths();
	} catch (error) {
		console.log(`❌ sitemap: ${error instanceof Error ? error.message : String(error)}`);
		process.exitCode = 1;
		return;
	}

	const mode = SLUGS_OVERRIDE.length > 0 ? 'override' : FULL ? 'full' : `muestra ${SAMPLE_SIZE}/tipo`;
	console.log(`/home + ${paths.length} páginas (${mode}):\n  ${paths.join('\n  ')}\n`);

	let failed = await report(HOME_EXPECTATIONS);
	for (const path of paths) {
		const expectations = expectationsFor(path);
		if (expectations) {
			failed = (await report(expectations)) || failed;
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
