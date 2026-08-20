/**
 * Tests e2e de SEO para la página de colección (`/collection/:slug`, entidad Collection).
 *
 * Sobre el HTML server-rendered (lo que ve el crawler, sin ejecutar JS):
 *  - A. Status 404 real del SSR para una colección inexistente (no 200 con página vacía).
 *  - B. Meta tags: title, description, og:/twitter:, canonical a la URL de la colección,
 *       robots indexable y keywords.
 *  - C. Datos estructurados: JSON-LD CollectionPage (mainEntity ItemList ordenado) y BreadcrumbList.
 *  - D. Bloques sitewide Organization y WebSite.
 *  - E. La tanda completa de invariantes de una página indexable.
 *
 * A diferencia de la página de storylist, acá la tanda completa corre sin `fixme`: el encabezado y el
 * listado de obras se server-renderizan sin diferir, así que el HTML trae H1 real y enlaces a `/read/`.
 */
import { test, expect } from '@playwright/test';

import { parseJsonLdBlocks, getMetaContent, getTitleText, getCanonicalHref } from '../_utils/seo';
import { assertValidJsonLd } from '@testing/json-ld-validation';
import { collectIndexableHtmlViolations } from '../_utils/seo-invariants';
import { STABLE_SLUGS, SCHEMA_IDS, SITEWIDE_SCHEMA_IDS } from '../_utils/seo-fixtures';

const collectionPath = `/collection/${STABLE_SLUGS.collection}`;
const requiredJsonLdIds = [...SITEWIDE_SCHEMA_IDS, SCHEMA_IDS.collectionPage, SCHEMA_IDS.breadcrumbCollection];

test('collection — A: una colección inexistente responde 404 real en SSR', async ({ request }) => {
	const response = await request.get('/collection/coleccion-inexistente-e2e');
	expect(response.status()).toBe(404);
});

test.describe('collection — HTML server-rendered de una colección existente', () => {
	let html: string;

	test.beforeAll(async ({ request }) => {
		html = await (await request.get(collectionPath)).text();
	});

	test('B: meta tags en el HTML server-rendered', () => {
		expect(getTitleText(html)).toBeTruthy();
		expect(getMetaContent(html, 'description')).toBeTruthy();
		expect(getMetaContent(html, 'og:title')).toBeTruthy();
		expect(getMetaContent(html, 'og:description')).toBeTruthy();
		expect(getMetaContent(html, 'twitter:title')).toBeTruthy();
		expect(getMetaContent(html, 'twitter:description')).toBeTruthy();
		expect(getCanonicalHref(html)).toContain(collectionPath);
		expect(getMetaContent(html, 'keywords')).toBeTruthy();
		// Se afirma la ausencia de `noindex` y no la presencia de `index`, que pasaría con las dos
		// políticas: `noindex` contiene ese substring.
		expect(getMetaContent(html, 'robots')).not.toContain('noindex');
	});

	test('C: JSON-LD CollectionPage con el listado ordenado de sus obras', async () => {
		const collection = parseJsonLdBlocks(html).get(SCHEMA_IDS.collectionPage);
		await assertValidJsonLd(collection);

		const mainEntity = collection?.['mainEntity'] as Record<string, unknown>;
		expect(mainEntity?.['@type']).toBe('ItemList');
		expect(Number(mainEntity?.['numberOfItems'])).toBeGreaterThan(0);

		const [firstItem] = (mainEntity?.['itemListElement'] ?? []) as Record<string, unknown>[];
		expect(firstItem?.['position']).toBe(1);
		expect(String(firstItem?.['url'])).toContain('/read/');
	});

	test('C: JSON-LD BreadcrumbList', async () => {
		const breadcrumb = parseJsonLdBlocks(html).get(SCHEMA_IDS.breadcrumbCollection);
		await assertValidJsonLd(breadcrumb);

		expect((breadcrumb?.['itemListElement'] as unknown[])?.length).toBeGreaterThanOrEqual(2);
	});

	test('C: no reusa el identificador de bloque de la página de storylist', () => {
		const blocks = parseJsonLdBlocks(html);

		expect(blocks.has(SCHEMA_IDS.collection)).toBe(false);
	});

	test('D: bloques sitewide Organization y WebSite presentes', () => {
		const blocks = parseJsonLdBlocks(html);

		expect(blocks.get(SCHEMA_IDS.organization)?.['@type']).toBe('Organization');
		expect(blocks.get(SCHEMA_IDS.website)?.['@type']).toBe('WebSite');
	});

	test('E: invariantes de página indexable (ssr, title, canonical, robots, h1, cuerpo, enlaces, jsonld)', async () => {
		expect(
			await collectIndexableHtmlViolations(html, {
				path: collectionPath,
				requiredJsonLdIds,
				requiredInternalLinkPrefix: '/read/',
			}),
		).toEqual([]);
	});
});
