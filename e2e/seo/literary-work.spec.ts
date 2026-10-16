/**
 * Tests e2e de SEO para la página de lectura (`/literary-work/:slug`, entidad LiteraryWork).
 *
 * Sobre el HTML server-rendered (lo que ve el crawler, sin ejecutar JS):
 *  - A. Status 404 real del SSR para una obra inexistente (no 200 con página vacía) y para un
 *       slug con un formato que el dominio rechaza (no 5xx).
 *  - B. Meta tags: <title> con la obra, description derivada del texto, og:/twitter: title y
 *       description, og:image de la portada, canonical a la URL de la obra, robots indexable, keywords
 *       y author (señal E-E-A-T).
 *  - C. Datos estructurados: JSON-LD Article (headline, datePublished, author Person[],
 *       publisher Organization; LiteraryWork no expone updatedAt y el builder omite dateModified)
 *       y BreadcrumbList.
 *  - D. Bloques sitewide Organization y WebSite.
 *  - E. La tanda completa de invariantes de una página indexable, H1 único y cuerpo saneado.
 *  - F. Un único enlace al perfil del autor.
 *  - G. Exclusión del extracto: los epígrafes y la nota editorial se sirven dentro de un bloque
 *       `data-nosnippet`, y el cuerpo de la obra queda fuera de esa exclusión.
 *
 * El contenido de prueba lo cura el equipo en los datasets (development local / staging CI).
 */
import { expect } from '@playwright/test';

import { test } from '../_utils/test';
import type { Article, BreadcrumbList, WithContext } from 'schema-dts';
import type { HTMLElement } from 'node-html-parser';

import { parseHtml, parseJsonLdBlocks, getMetaContent, getTitleText, getCanonicalHref } from '../_utils/seo';
import { assertValidJsonLd } from '@testing/json-ld-validation';
import { resolveSearchImage } from '@utils/sanity-image.utils';
import { collectIndexableHtmlViolations, getInternalLinkHrefs } from '../_utils/seo-invariants';
import { STABLE_SLUGS, SCHEMA_IDS, SITEWIDE_SCHEMA_IDS } from '../_utils/seo-fixtures';
import { fetchLiteraryWork } from '../_utils/literary-work-fixtures';

const literaryWorkPath = `/literary-work/${STABLE_SLUGS.literaryWork}`;
const literaryWorkWithEpigraphsPath = `/literary-work/${STABLE_SLUGS.literaryWorkWithEpigraphs}`;
const DEFAULT_OG_IMAGE_PATTERN = /\/assets\/img\/og-default\.jpg$/;
const requiredJsonLdIds = [...SITEWIDE_SCHEMA_IDS, SCHEMA_IDS.article, SCHEMA_IDS.breadcrumbLiteraryWork];

test('literary-work — A: una obra inexistente responde 404 real en SSR', async ({ request }) => {
	const response = await request.get('/literary-work/obra-inexistente-e2e');
	expect(response.status()).toBe(404);
});

// No depende del dataset: el API rechaza el formato antes de consultar.
test('literary-work — A: un slug con un formato que el dominio rechaza responde 404, no 5xx', async ({ request }) => {
	const response = await request.get('/literary-work/IcyFox');
	expect(response.status()).toBe(404);
});

test.describe('literary-work — HTML server-rendered de una obra existente', () => {
	let html: string;

	test.beforeAll(async ({ request }) => {
		const response = await request.get(literaryWorkPath);
		// Sin esto, un slug que desapareció del dataset hace fallar los cinco casos por "expected truthy",
		// sin nombrar la causa. Se afirma en vez de saltearse: es el skip el que ya dejó un verde engañoso.
		expect(response.status(), `No existe literaryWork con slug "${STABLE_SLUGS.literaryWork}" en el dataset`).toBe(200);
		html = await response.text();
	});

	test('B: meta tags en el HTML server-rendered', () => {
		expect(getTitleText(html)).toBeTruthy();
		expect(getMetaContent(html, 'description')).toBeTruthy();
		expect(getMetaContent(html, 'og:title')).toBeTruthy();
		expect(getMetaContent(html, 'og:description')).toBeTruthy();
		expect(getMetaContent(html, 'twitter:title')).toBeTruthy();
		expect(getMetaContent(html, 'twitter:description')).toBeTruthy();
		expect(getCanonicalHref(html)).toContain(literaryWorkPath);
		expect(getMetaContent(html, 'keywords')).toBeTruthy();
		expect(getMetaContent(html, 'author')).toBeTruthy();
		// Se afirma la ausencia de `noindex` y no la presencia de `index`, que pasaría con las dos
		// políticas: `noindex` contiene ese substring.
		expect(getMetaContent(html, 'robots')).not.toContain('noindex');
	});

	test('C: JSON-LD Article de la obra', async () => {
		const article = parseJsonLdBlocks(html).get(SCHEMA_IDS.article) as WithContext<Article> | undefined;
		await assertValidJsonLd(article);

		expect(article?.['@type']).toBe('Article');
		expect(article?.headline).toBeTruthy();
		expect(article?.datePublished).toBeTruthy();
		expect(String(article?.mainEntityOfPage)).toContain('/literary-work/');
	});

	test('B: la description sale del texto de la obra, no de la descripción genérica', () => {
		expect(getMetaContent(html, 'description')).not.toMatch(/^Una lectura en La Cuentoneta/);
	});

	// La expectativa sale de la portada que sirve el API, con la regla de la app: una raster del CDN se
	// declara como og:image, y la SVG genérica o su ausencia dejan el og:image por defecto. El Article
	// declara esa misma portada o ninguna: cuándo la omite por tamaño lo cubren los specs unitarios.
	test('B: og:image e image del Article siguen a la portada de la obra', async ({ request }) => {
		const literaryWork = await fetchLiteraryWork(request, STABLE_SLUGS.literaryWork);
		expect(literaryWork, `el API no sirve "${STABLE_SLUGS.literaryWork}": no habría con qué comparar`).toBeDefined();
		const coverUrl = resolveSearchImage(literaryWork?.coverImage ?? '')?.url;
		const article = parseJsonLdBlocks(html).get(SCHEMA_IDS.article);

		expect(getMetaContent(html, 'og:image')).toEqual(coverUrl ?? expect.stringMatching(DEFAULT_OG_IMAGE_PATTERN));
		expect([undefined, coverUrl]).toContain(article?.['image']);
	});

	test('C: JSON-LD BreadcrumbList', async () => {
		const breadcrumb = parseJsonLdBlocks(html).get(SCHEMA_IDS.breadcrumbLiteraryWork) as
			WithContext<BreadcrumbList> | undefined;
		await assertValidJsonLd(breadcrumb);

		const items = breadcrumb?.itemListElement;
		expect(Array.isArray(items) ? items.length : 0).toBeGreaterThanOrEqual(2);
	});

	test('D: bloques sitewide Organization y WebSite presentes', () => {
		const blocks = parseJsonLdBlocks(html);

		expect(blocks.get(SCHEMA_IDS.organization)?.['@type']).toBe('Organization');
		expect(blocks.get(SCHEMA_IDS.website)?.['@type']).toBe('WebSite');
	});

	test('E: invariantes de página indexable (ssr, title, canonical, robots, h1, cuerpo, enlaces, jsonld)', async () => {
		expect(
			await collectIndexableHtmlViolations(html, {
				path: literaryWorkPath,
				requiredJsonLdIds,
				requiredInternalLinkPrefix: '/author/',
			}),
		).toEqual([]);
	});

	test('E: H1 único con contenido real y cuerpo saneado', () => {
		expect(html.match(/<h1[^>]*>/g) ?? []).toHaveLength(1);
		expect(html).toContain('<article');
		// El markdown crudo no cruza al frontend: sin ** literales dentro del artículo.
		expect(html).not.toMatch(/<article[^>]*>[\s\S]*\*\*[\s\S]*<\/article>/);
	});

	// Un segundo enlace al mismo perfil le da al crawler dos rutas equivalentes, y en el DOM dos
	// destinos que el lector de pantalla anuncia igual salvo que cada uno traiga su propio nombre
	// accesible. Acá se exige uno solo, que es más estricto que pedir nombres distinguibles: el pie
	// sugiere más obras del autor, pero su bloque es diferido sin `hydrate`, así que en el HTML servido
	// hay marcador de posición y no enlace. Si ese diferido pasara a hidratarse, la corrección no es
	// subir el número: es traer acá el criterio de nombres distinguibles que hoy vive en el spec de la
	// página hidratada.
	//
	// El slug se resuelve en el caso y no en el `beforeAll`: el resto de la tanda solo necesita el HTML
	// ya capturado, y un endpoint caído no tiene por qué tumbarla entera.
	test('F: enlaza al perfil del autor una sola vez', async ({ request }) => {
		const primaryAuthorSlug = (await fetchLiteraryWork(request, STABLE_SLUGS.literaryWork))?.authors[0]?.slug;
		expect(
			primaryAuthorSlug,
			`el API no sirve "${STABLE_SLUGS.literaryWork}": no habría con qué comparar`,
		).toBeDefined();

		expect(getInternalLinkHrefs(html, '/author/')).toEqual([`/author/${primaryAuthorSlug}`]);
	});
});

// Google solo reconoce el atributo en estos tags; Bing lo acepta en cualquiera, así que el
// subconjunto documentado por ambos es el que se exige.
const SNIPPET_ELEMENT_TAGS = Object.freeze(['DIV', 'SPAN', 'SECTION']);

test.describe('literary-work — bloques editoriales excluidos del extracto de búsqueda', () => {
	let root: HTMLElement;
	let epigraphCount: number;
	let epigraphReferenceCount: number;
	let expectedEditorialBlockCount: number;

	test.beforeAll(async ({ request }) => {
		const response = await request.get(literaryWorkWithEpigraphsPath);
		expect(
			response.status(),
			`No existe literaryWork con slug "${STABLE_SLUGS.literaryWorkWithEpigraphs}" en el dataset`,
		).toBe(200);
		root = parseHtml(await response.text());

		const literaryWork = await fetchLiteraryWork(request, STABLE_SLUGS.literaryWorkWithEpigraphs);
		expect(
			literaryWork,
			`el API no sirve "${STABLE_SLUGS.literaryWorkWithEpigraphs}": no habría con qué comparar`,
		).toBeDefined();

		const epigraphs = (literaryWork?.content ?? []).flatMap((section) => section.epigraphs ?? []);
		epigraphCount = epigraphs.length;
		epigraphReferenceCount = epigraphs.filter((epigraph) => Boolean(epigraph.reference)).length;
		const hasEditorialNote = Boolean(literaryWork?.editorialNote);
		expectedEditorialBlockCount = epigraphCount + Number(hasEditorialNote);

		// Si la curaduría pierde el epígrafe, su fuente o la nota, los casos de abajo pasarían sin
		// cubrir nada: se afirma en vez de saltearse, como en el resto del archivo.
		expect(epigraphCount, `"${STABLE_SLUGS.literaryWorkWithEpigraphs}" no trae epígrafes`).toBeGreaterThan(0);
		expect(
			epigraphReferenceCount,
			`"${STABLE_SLUGS.literaryWorkWithEpigraphs}" no trae epígrafe con fuente`,
		).toBeGreaterThan(0);
		expect(hasEditorialNote, `"${STABLE_SLUGS.literaryWorkWithEpigraphs}" no trae nota editorial`).toBe(true);
	});

	test('G: cada bloque editorial se sirve dentro de un ancestro excluido del extracto', () => {
		expect(root.querySelectorAll('cuentoneta-editorial-note')).toHaveLength(expectedEditorialBlockCount);

		const exclusions = root.querySelectorAll('cuentoneta-editorial-note [data-nosnippet]');
		expect(exclusions).toHaveLength(expectedEditorialBlockCount);
		expect(exclusions.filter((exclusion) => !SNIPPET_ELEMENT_TAGS.includes(exclusion.tagName))).toEqual([]);
		expect(exclusions.filter((exclusion) => exclusion.querySelector('[data-testid="content"]') === null)).toEqual([]);

		// El pie de la figura —la atribución del epígrafe— también es texto ajeno a la obra.
		const references = root.querySelectorAll('cuentoneta-editorial-note [data-testid="reference"]');
		expect(references).toHaveLength(epigraphReferenceCount);
		expect(references.filter((reference) => reference.closest('[data-nosnippet]') === null)).toEqual([]);
	});

	test('G: el cuerpo de la obra queda fuera de esa exclusión', () => {
		// Cubre el atributo tanto en el propio cuerpo como en cualquier ancestro suyo.
		expect(
			root.querySelector(
				'[data-testid="literary-work-section-body"][data-nosnippet], [data-nosnippet] [data-testid="literary-work-section-body"]',
			),
		).toBeNull();
		// La exclusión no se desparrama: los bloques editoriales son los únicos que la declaran.
		expect(root.querySelectorAll('[data-nosnippet]')).toHaveLength(expectedEditorialBlockCount);
	});
});
