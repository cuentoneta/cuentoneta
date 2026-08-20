/**
 * Tests e2e de SEO para el catálogo de colecciones (`/collection`).
 *
 * Sobre el HTML server-rendered (lo que ve el crawler, sin ejecutar JS):
 *  - A. Meta tags: title, description, og:/twitter:, canonical a `/collection`, robots indexable y keywords.
 *  - B. Datos estructurados: JSON-LD CollectionPage con el `ItemList` del catálogo, y aparte el BreadcrumbList.
 *  - C. Bloques sitewide Organization y WebSite.
 *  - D. La tanda completa de invariantes de una página indexable, con enlaces salientes a `/collection/`.
 *
 * La tanda corre sin `fixme`: la página sirve su grilla sin diferir, así que el HTML trae H1 real y los
 * enlaces a cada colección. Y el catálogo se **afirma** no vacío en vez de saltearse — un skip acá dejaría
 * un verde engañoso justo donde el valor del cambio se mide.
 */
import { test, expect } from '@playwright/test';

import { parseJsonLdBlocks, getMetaContent, getTitleText, getCanonicalHref } from '../_utils/seo';
import { assertValidJsonLd } from '@testing/json-ld-validation';
import { collectIndexableHtmlViolations } from '../_utils/seo-invariants';
import { SCHEMA_IDS, SITEWIDE_SCHEMA_IDS } from '../_utils/seo-fixtures';

const catalogPath = '/collection';
const requiredJsonLdIds = [
	...SITEWIDE_SCHEMA_IDS,
	SCHEMA_IDS.collectionCatalog,
	SCHEMA_IDS.breadcrumbCollectionCatalog,
];

let html: string;

test.beforeAll(async ({ request }) => {
	const response = await request.get(catalogPath);
	expect(response.status(), 'el catálogo de colecciones no respondió 200').toBe(200);
	html = await response.text();
});

test('collections — A: meta tags en el HTML server-rendered', () => {
	expect(getTitleText(html)).toContain('Colecciones');
	expect(getMetaContent(html, 'description')).toBeTruthy();
	expect(getMetaContent(html, 'og:title')).toBeTruthy();
	expect(getMetaContent(html, 'og:description')).toBeTruthy();
	expect(getMetaContent(html, 'twitter:title')).toBeTruthy();
	expect(getMetaContent(html, 'twitter:description')).toBeTruthy();
	expect(getCanonicalHref(html)).toContain(catalogPath);
	expect(getMetaContent(html, 'keywords')).toBeTruthy();
	// La ausencia de `noindex` y no la presencia de `index`, que pasaría con las dos políticas.
	expect(getMetaContent(html, 'robots')).not.toContain('noindex');
});

test('collections — B: JSON-LD CollectionPage con el listado del catálogo', async () => {
	const catalog = parseJsonLdBlocks(html).get(SCHEMA_IDS.collectionCatalog);
	await assertValidJsonLd(catalog);

	const mainEntity = catalog?.['mainEntity'] as Record<string, unknown>;
	expect(mainEntity?.['@type']).toBe('ItemList');
	expect(Number(mainEntity?.['numberOfItems'])).toBeGreaterThan(0);

	const [firstItem] = (mainEntity?.['itemListElement'] ?? []) as Record<string, unknown>[];
	expect(firstItem?.['position']).toBe(1);
	expect(String(firstItem?.['url'])).toContain('/collection/');
});

test('collections — B: JSON-LD BreadcrumbList', async () => {
	const breadcrumb = parseJsonLdBlocks(html).get(SCHEMA_IDS.breadcrumbCollectionCatalog);
	await assertValidJsonLd(breadcrumb);

	expect((breadcrumb?.['itemListElement'] as unknown[])?.length).toBe(2);
});

test('collections — C: bloques sitewide Organization y WebSite presentes', () => {
	const blocks = parseJsonLdBlocks(html);

	expect(blocks.get(SCHEMA_IDS.organization)?.['@type']).toBe('Organization');
	expect(blocks.get(SCHEMA_IDS.website)?.['@type']).toBe('WebSite');
});

test('collections — D: invariantes de página indexable (ssr, title, canonical, robots, h1, cuerpo, enlaces, jsonld)', async () => {
	expect(
		await collectIndexableHtmlViolations(html, {
			path: catalogPath,
			requiredJsonLdIds,
			requiredInternalLinkPrefix: '/collection/',
		}),
	).toEqual([]);
});
