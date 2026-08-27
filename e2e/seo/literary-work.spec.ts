/**
 * Tests e2e de SEO para el catálogo de obras (`/literary-work`).
 *
 * La tanda completa corre sin `fixme`: la página no difiere nada, así que el HTML servido trae la
 * tabla entera con el enlace a la lectura de cada obra.
 */
import { test, expect } from '@playwright/test';

import { parseJsonLdBlocks, getMetaContent, getTitleText, getCanonicalHref } from '../_utils/seo';
import { assertValidJsonLd } from '@testing/json-ld-validation';
import { collectIndexableHtmlViolations } from '../_utils/seo-invariants';
import { SCHEMA_IDS, SITEWIDE_SCHEMA_IDS } from '../_utils/seo-fixtures';

const catalogPath = '/literary-work';
const requiredJsonLdIds = [
	...SITEWIDE_SCHEMA_IDS,
	SCHEMA_IDS.literaryWorkCatalog,
	SCHEMA_IDS.breadcrumbLiteraryWorkCatalog,
];

test.describe('literary-work — HTML server-rendered del catálogo', () => {
	let html: string;

	test.beforeAll(async ({ request }) => {
		const response = await request.get(catalogPath);
		expect(response.status(), 'el catálogo de obras no respondió 200').toBe(200);
		html = await response.text();
	});

	test('A: meta tags en el HTML server-rendered', () => {
		expect(getTitleText(html)).toContain('Obras');
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
		const catalog = parseJsonLdBlocks(html).get(SCHEMA_IDS.literaryWorkCatalog);
		await assertValidJsonLd(catalog);

		const mainEntity = catalog?.['mainEntity'] as Record<string, unknown>;
		expect(mainEntity?.['@type']).toBe('ItemList');
		expect(Number(mainEntity?.['numberOfItems'])).toBeGreaterThan(0);

		// El catálogo vive en `/literary-work` y cada obra en `/read/<slug>`: el elemento apunta a la
		// lectura, no al listado.
		const [firstItem] = (mainEntity?.['itemListElement'] ?? []) as Record<string, unknown>[];
		expect(firstItem?.['position']).toBe(1);
		expect(String(firstItem?.['url'])).toContain('/read/');
	});

	test('B: JSON-LD BreadcrumbList', async () => {
		const breadcrumb = parseJsonLdBlocks(html).get(SCHEMA_IDS.breadcrumbLiteraryWorkCatalog);
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
				requiredInternalLinkPrefix: '/read/',
				h1Pattern: /\d+ Obras?/,
			}),
		).toEqual([]);
	});
});
