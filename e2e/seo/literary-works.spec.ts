/**
 * Tests e2e de SEO para el catálogo de obras (`/literary-work`).
 *
 * La tanda completa corre sin `fixme`: la página no difiere nada, así que el HTML servido trae la
 * tabla entera con el enlace a la lectura de cada obra. Además se afirma que el estado transferido del
 * SSR transporta solo el sobre del catálogo y las claves de su entrada.
 */
import { expect } from '@playwright/test';

import { test } from '../_utils/test';

import { parseJsonLdBlocks, getMetaContent, getTitleText, getCanonicalHref, getTransferState } from '../_utils/seo';
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

		// El catálogo vive en `/literary-work` y cada obra en `/literary-work/<slug>`: el elemento apunta a la
		// lectura, no al listado.
		const [firstItem] = (mainEntity?.['itemListElement'] ?? []) as Record<string, unknown>[];
		expect(firstItem?.['position']).toBe(1);
		expect(String(firstItem?.['url'])).toContain('/literary-work/');
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
				requiredInternalLinkPrefix: '/literary-work/',
				h1Pattern: /\d+ Obras?/,
			}),
		).toEqual([]);
	});

	// Con `Prerender`, el HTML del catálogo queda horneado en el build: el fallo del endpoint que lo
	// alimenta se sirve congelado todo el ciclo de release. `ssg` es el marcador de ese artefacto, así
	// que afirmar `ssr` es afirmar que la página se renderiza por request.
	test('E: se renderiza por request, no desde un artefacto del build', () => {
		expect(html).toContain('ng-server-context="ssr"');
	});

	// Este bloque es una copia de la respuesta del catálogo: si la respuesta volviera a transportar el
	// extracto, la portada o el autor completo, el HTML crecería con ella.
	test('F: el estado transferido transporta solo el catálogo', () => {
		const catalog = Object.values(getTransferState(html))
			.map((response) => (response as { b?: unknown } | null)?.b)
			.find((body): body is Record<string, unknown> => typeof body === 'object' && body !== null && 'entries' in body);
		expect(catalog, 'el estado transferido no incluye la respuesta del catálogo').toBeDefined();

		const entries = (catalog?.['entries'] ?? []) as Record<string, unknown>[];
		expect(Object.keys(catalog ?? {}).sort()).toEqual(['entries', 'total']);
		expect(catalog?.['total']).toBe(entries.length);
		entries.forEach((entry) => {
			expect(Object.keys(entry).sort()).toEqual(['authors', 'kind', 'slug', 'tags', 'title', 'totalReadingTime']);
			(entry['authors'] as object[]).forEach((author) => expect(Object.keys(author).sort()).toEqual(['name', 'slug']));
			(entry['tags'] as object[]).forEach((tag) => expect(Object.keys(tag).sort()).toEqual(['slug', 'title']));
		});
	});
});
