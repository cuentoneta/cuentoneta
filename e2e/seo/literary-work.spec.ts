/**
 * Tests e2e de SEO para la página de lectura (`/literary-work/:slug`, entidad LiteraryWork).
 *
 * Sobre el HTML server-rendered (lo que ve el crawler, sin ejecutar JS):
 *  - A. Status 404 real del SSR para una obra inexistente (no 200 con página vacía).
 *  - B. Meta tags: <title> con la obra, description, og:/twitter: title y description,
 *       canonical a la URL de la obra, robots indexable, keywords y author (señal E-E-A-T).
 *  - C. Datos estructurados: JSON-LD Article (headline, datePublished, author Person[],
 *       publisher Organization; LiteraryWork no expone updatedAt y el builder omite dateModified)
 *       y BreadcrumbList.
 *  - D. Bloques sitewide Organization y WebSite.
 *  - E. La tanda completa de invariantes de una página indexable, H1 único y cuerpo saneado.
 *  - F. Un único enlace al perfil del autor.
 *
 * El contenido de prueba lo cura el equipo en los datasets (development local / staging CI).
 */
import { test, expect } from '@playwright/test';
import type { Article, BreadcrumbList, WithContext } from 'schema-dts';

import { parseJsonLdBlocks, getMetaContent, getTitleText, getCanonicalHref } from '../_utils/seo';
import { assertValidJsonLd } from '@testing/json-ld-validation';
import { collectIndexableHtmlViolations, getInternalLinkHrefs } from '../_utils/seo-invariants';
import { STABLE_SLUGS, SCHEMA_IDS, SITEWIDE_SCHEMA_IDS } from '../_utils/seo-fixtures';
import { fetchLiteraryWork } from '../_utils/literary-work-fixtures';

const literaryWorkPath = `/literary-work/${STABLE_SLUGS.literaryWork}`;
const requiredJsonLdIds = [...SITEWIDE_SCHEMA_IDS, SCHEMA_IDS.article, SCHEMA_IDS.breadcrumbLiteraryWork];

test('literary-work — A: una obra inexistente responde 404 real en SSR', async ({ request }) => {
	const response = await request.get('/literary-work/obra-inexistente-e2e');
	expect(response.status()).toBe(404);
});

test.describe('literary-work — HTML server-rendered de una obra existente', () => {
	let html: string;
	let primaryAuthorSlug: string | undefined;

	test.beforeAll(async ({ request }) => {
		const response = await request.get(literaryWorkPath);
		// Sin esto, un slug que desapareció del dataset hace fallar los cinco casos por "expected truthy",
		// sin nombrar la causa. Se afirma en vez de saltearse: es el skip el que ya dejó un verde engañoso.
		expect(response.status(), `No existe literaryWork con slug "${STABLE_SLUGS.literaryWork}" en el dataset`).toBe(200);
		html = await response.text();
		primaryAuthorSlug = (await fetchLiteraryWork(request, STABLE_SLUGS.literaryWork))?.authors[0]?.slug;
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

	// Un segundo enlace al mismo perfil le da al crawler dos rutas equivalentes y, en el DOM, dos
	// destinos que el lector de pantalla anuncia igual salvo que cada uno traiga su propio nombre
	// accesible. El pie sugiere más obras del autor, pero su bloque es diferido sin `hydrate`: en el
	// HTML servido está el marcador de posición y no el enlace. Si ese diferido pasara a hidratarse, la
	// cuenta sube y este caso lo reporta.
	test('F: enlaza al perfil del autor una sola vez', () => {
		expect(getInternalLinkHrefs(html, '/author/')).toEqual([`/author/${primaryAuthorSlug}`]);
	});

	test('E: H1 único con contenido real y cuerpo saneado', () => {
		expect(html.match(/<h1[^>]*>/g) ?? []).toHaveLength(1);
		expect(html).toContain('<article');
		// El markdown crudo no cruza al frontend: sin ** literales dentro del artículo.
		expect(html).not.toMatch(/<article[^>]*>[\s\S]*\*\*[\s\S]*<\/article>/);
	});
});
