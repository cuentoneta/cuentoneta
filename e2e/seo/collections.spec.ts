/**
 * Tests e2e de SEO para el catálogo de colecciones (`/collection`).
 *
 * La tanda completa de invariantes corre sin `fixme`: esta página no difiere nada, así que el HTML
 * trae encabezado real y los enlaces a cada colección.
 *
 * E. Los títulos de las tarjetas quedan un nivel por debajo del encabezado del listado.
 */
import { expect } from '@playwright/test';

import { test } from '../_utils/test';

import { parseHtml, parseJsonLdBlocks, getMetaContent, getTitleText, getCanonicalHref } from '../_utils/seo';
import { assertValidJsonLd } from '@testing/json-ld-validation';
import { collectIndexableHtmlViolations } from '../_utils/seo-invariants';
import { SCHEMA_IDS, SITEWIDE_SCHEMA_IDS } from '../_utils/seo-fixtures';

const catalogPath = '/collection';
const requiredJsonLdIds = [
	...SITEWIDE_SCHEMA_IDS,
	SCHEMA_IDS.collectionCatalog,
	SCHEMA_IDS.breadcrumbCollectionCatalog,
];

test.describe('collections — HTML server-rendered del catálogo', () => {
	let html: string;

	test.beforeAll(async ({ request }) => {
		const response = await request.get(catalogPath);
		expect(response.status(), 'el catálogo de colecciones no respondió 200').toBe(200);
		html = await response.text();
	});

	test('A: meta tags en el HTML server-rendered', () => {
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

	test('B: JSON-LD CollectionPage con el listado del catálogo', async () => {
		const catalog = parseJsonLdBlocks(html).get(SCHEMA_IDS.collectionCatalog);
		await assertValidJsonLd(catalog);

		const mainEntity = catalog?.['mainEntity'] as Record<string, unknown>;
		expect(mainEntity?.['@type']).toBe('ItemList');
		expect(Number(mainEntity?.['numberOfItems'])).toBeGreaterThan(0);

		const [firstItem] = (mainEntity?.['itemListElement'] ?? []) as Record<string, unknown>[];
		expect(firstItem?.['position']).toBe(1);
		expect(String(firstItem?.['url'])).toContain('/collection/');
	});

	test('B: JSON-LD BreadcrumbList', async () => {
		const breadcrumb = parseJsonLdBlocks(html).get(SCHEMA_IDS.breadcrumbCollectionCatalog);
		await assertValidJsonLd(breadcrumb);

		expect((breadcrumb?.['itemListElement'] as unknown[])?.length).toBe(2);
	});

	test('C: bloques sitewide Organization y WebSite presentes', () => {
		const blocks = parseJsonLdBlocks(html);

		expect(blocks.get(SCHEMA_IDS.organization)?.['@type']).toBe('Organization');
		expect(blocks.get(SCHEMA_IDS.website)?.['@type']).toBe('WebSite');
	});

	test('D: invariantes de página indexable (ssr, title, canonical, robots, h1, cuerpo, enlaces, jsonld)', async () => {
		expect(
			await collectIndexableHtmlViolations(html, {
				path: catalogPath,
				requiredJsonLdIds,
				requiredInternalLinkPrefix: '/collection/',
			}),
		).toEqual([]);
	});

	test('E: los títulos de las tarjetas quedan un nivel por debajo del encabezado del listado', () => {
		const listing = parseHtml(html).querySelector('[data-testid="collections"]');
		const [listingHeading, ...cardHeadings] = listing?.querySelectorAll('h1, h2, h3, h4, h5, h6') ?? [];

		expect(listingHeading?.tagName, 'el listado de colecciones no abre con su encabezado').toBe('H2');
		expect(cardHeadings.length, 'el catálogo no trajo ninguna tarjeta de colección').toBeGreaterThan(0);
		expect(cardHeadings.filter((heading) => heading.tagName !== 'H3').map((heading) => heading.text.trim())).toEqual(
			[],
		);
	});
});
