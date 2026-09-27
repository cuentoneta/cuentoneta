/**
 * Tests e2e de SEO para el índice de autores (`/authors`).
 *
 * La tanda completa de invariantes corre sin `fixme`: esta página no difiere nada, así que el HTML
 * trae encabezado real y los enlaces a cada perfil.
 */
import { expect } from '@playwright/test';

import { test } from '../_utils/test';

import { parseJsonLdBlocks, getMetaContent, getTitleText, getCanonicalHref } from '../_utils/seo';
import { assertValidJsonLd } from '@testing/json-ld-validation';
import { collectIndexableHtmlViolations } from '../_utils/seo-invariants';
import { SCHEMA_IDS, SITEWIDE_SCHEMA_IDS } from '../_utils/seo-fixtures';

const indexPath = '/authors';
const requiredJsonLdIds = [...SITEWIDE_SCHEMA_IDS, SCHEMA_IDS.authorCatalog, SCHEMA_IDS.breadcrumbAuthorCatalog];

test.describe('authors — HTML server-rendered del índice', () => {
	let html: string;

	test.beforeAll(async ({ request }) => {
		const response = await request.get(indexPath);
		expect(response.status(), 'el índice de autores no respondió 200').toBe(200);
		html = await response.text();
	});

	test('A: meta tags en el HTML server-rendered', () => {
		expect(getTitleText(html)).toContain('Autores');
		expect(getMetaContent(html, 'description')).toBeTruthy();
		expect(getMetaContent(html, 'og:title')).toBeTruthy();
		expect(getMetaContent(html, 'og:description')).toBeTruthy();
		expect(getMetaContent(html, 'twitter:title')).toBeTruthy();
		expect(getMetaContent(html, 'twitter:description')).toBeTruthy();
		expect(getCanonicalHref(html)).toContain(indexPath);
		expect(getMetaContent(html, 'keywords')).toBeTruthy();
		// La ausencia de `noindex` y no la presencia de `index`, que pasaría con las dos políticas.
		expect(getMetaContent(html, 'robots')).not.toContain('noindex');
	});

	test('B: JSON-LD CollectionPage con el listado de autores', async () => {
		const index = parseJsonLdBlocks(html).get(SCHEMA_IDS.authorCatalog);
		await assertValidJsonLd(index);

		const mainEntity = index?.['mainEntity'] as Record<string, unknown>;
		expect(mainEntity?.['@type']).toBe('ItemList');
		expect(Number(mainEntity?.['numberOfItems'])).toBeGreaterThan(0);

		const [firstItem] = (mainEntity?.['itemListElement'] ?? []) as Record<string, unknown>[];
		expect(firstItem?.['position']).toBe(1);
		expect(String(firstItem?.['url'])).toContain('/author/');
	});

	test('B: JSON-LD BreadcrumbList', async () => {
		const breadcrumb = parseJsonLdBlocks(html).get(SCHEMA_IDS.breadcrumbAuthorCatalog);
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
				path: indexPath,
				requiredJsonLdIds,
				requiredInternalLinkPrefix: '/author/',
			}),
		).toEqual([]);
	});
});
