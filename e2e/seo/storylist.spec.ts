/**
 * Tests e2e de SEO para la página de storylist/colección (`/storylist/:slug`).
 *
 * Sobre el HTML server-rendered (lo que ve el crawler, sin ejecutar JS):
 *  - A. Meta tags: <title> con la colección, description, og:/twitter: title y description,
 *       canonical a la URL de la storylist, robots indexable y keywords.
 *  - B. Datos estructurados: JSON-LD CollectionPage (mainEntity ItemList con numberOfItems y
 *       ListItems ordenados) y BreadcrumbList.
 *  - C. Bloques sitewide Organization y WebSite.
 *
 * Sobre el DOM hidratado, vía navegación in-app (router):
 *  - D. Al navegar a un cuento de la colección, los bloques de la storylist (CollectionPage +
 *       breadcrumb) se remueven y aparece el Article; sin duplicar canonical ni <title>.
 *  - E. Al navegar a la home (que no emite structured data propia), los bloques de la storylist
 *       se remueven igual y persisten solo los sitewide — regresión de #1578.
 */
import { test, expect } from '@playwright/test';

import { parseJsonLdBlocks, getMetaContent, getTitleText, getCanonicalHref } from '../_utils/seo';
import { STABLE_SLUGS, SCHEMA_IDS } from '../_utils/seo-fixtures';

const storylistPath = `/storylist/${STABLE_SLUGS.storylist}`;

test('storylist — A: meta tags en el HTML server-rendered', async ({ request }) => {
	const html = await (await request.get(storylistPath)).text();

	expect(getTitleText(html)).toBeTruthy();
	expect(getMetaContent(html, 'description')).toBeTruthy();
	expect(getMetaContent(html, 'og:title')).toBeTruthy();
	expect(getMetaContent(html, 'og:description')).toBeTruthy();
	expect(getMetaContent(html, 'twitter:title')).toBeTruthy();
	expect(getMetaContent(html, 'twitter:description')).toBeTruthy();
	expect(getCanonicalHref(html)).toContain(storylistPath);
	expect(getMetaContent(html, 'robots')).toContain('index');
	expect(getMetaContent(html, 'keywords')).toBeTruthy();
});

test('storylist — B: JSON-LD CollectionPage y BreadcrumbList', async ({ request }) => {
	const html = await (await request.get(storylistPath)).text();
	const blocks = parseJsonLdBlocks(html);

	const collection = blocks.get(SCHEMA_IDS.collection);
	expect(collection?.['@context']).toBe('https://schema.org');
	expect(collection?.['@type']).toBe('CollectionPage');
	const mainEntity = collection?.['mainEntity'] as Record<string, unknown>;
	expect(mainEntity?.['@type']).toBe('ItemList');
	expect(Number(mainEntity?.['numberOfItems'])).toBeGreaterThan(0);
	const listElements = mainEntity?.['itemListElement'] as Record<string, unknown>[];
	expect(listElements?.length).toBeGreaterThan(0);
	expect(listElements?.[0]?.['@type']).toBe('ListItem');
	expect(listElements?.[0]?.['position']).toBe(1);

	const breadcrumb = blocks.get(SCHEMA_IDS.breadcrumbStorylist);
	expect(breadcrumb?.['@type']).toBe('BreadcrumbList');
	expect((breadcrumb?.['itemListElement'] as unknown[])?.length).toBeGreaterThanOrEqual(2);
});

test('storylist — C: bloques sitewide Organization y WebSite presentes', async ({ request }) => {
	const html = await (await request.get(storylistPath)).text();
	const blocks = parseJsonLdBlocks(html);

	expect(blocks.get(SCHEMA_IDS.organization)?.['@type']).toBe('Organization');
	expect(blocks.get(SCHEMA_IDS.website)?.['@type']).toBe('WebSite');
});

test('storylist — D: al navegar a un cuento se remueven los bloques de la colección', async ({ page }) => {
	await page.goto(storylistPath);
	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.collection}"]`)).toHaveCount(1);

	await page.locator('a[href^="/story/"]').first().click();
	await expect(page).toHaveURL(/\/story\//);
	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.article}"]`)).toHaveCount(1);

	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.collection}"]`)).toHaveCount(0);
	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.breadcrumbStorylist}"]`)).toHaveCount(0);
	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.organization}"]`)).toHaveCount(1);
	await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
	await expect(page.locator('head > title')).toHaveCount(1);
});

test('storylist — E: al navegar a la home se remueven los bloques de la colección', async ({ page }) => {
	await page.goto(storylistPath);
	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.collection}"]`)).toHaveCount(1);

	await page.locator('a[href$="/home"]').first().click();
	await expect(page).toHaveURL(/\/home/);

	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.collection}"]`)).toHaveCount(0);
	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.breadcrumbStorylist}"]`)).toHaveCount(0);
	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.organization}"]`)).toHaveCount(1);
	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.website}"]`)).toHaveCount(1);
	await expect(page.locator('head > title')).toHaveCount(1);
});
