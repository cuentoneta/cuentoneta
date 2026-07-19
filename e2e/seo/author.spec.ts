/**
 * Tests e2e de SEO para la página de autor (`/author/:slug`).
 *
 * Sobre el HTML server-rendered (lo que ve el crawler, sin ejecutar JS):
 *  - A. Meta tags: <title> con el autor, description del perfil, og:/twitter: title y
 *       description, canonical a la URL del autor, robots indexable y keywords.
 *  - B. Datos estructurados: JSON-LD ProfilePage (dateCreated, dateModified, mainEntity Person)
 *       y BreadcrumbList.
 *  - C. Bloques sitewide Organization y WebSite.
 *
 * Sobre el DOM hidratado, vía navegación in-app (router):
 *  - D. Al volver a la home (logo del header), los bloques del autor se remueven y los
 *       sitewide persisten; sin duplicar canonical ni <title>.
 */
import { test, expect } from '@playwright/test';

import { parseJsonLdBlocks, getMetaContent, getTitleText, getCanonicalHref } from '../_utils/seo';
import { assertValidJsonLd } from '../_utils/json-ld-validation';
import { collectIndexableHtmlViolations } from '../_utils/seo-invariants';
import { STABLE_SLUGS, SCHEMA_IDS, SITEWIDE_SCHEMA_IDS } from '../_utils/seo-fixtures';

const authorPath = `/author/${STABLE_SLUGS.author}`;

let html: string;

test.beforeAll(async ({ request }) => {
	html = await (await request.get(authorPath)).text();
});

test('author — A: meta tags en el HTML server-rendered', async () => {
	expect(getTitleText(html)).toMatch(/borges/i);
	expect(getMetaContent(html, 'description')).toMatch(/borges/i);
	expect(getMetaContent(html, 'og:title')).toBeTruthy();
	expect(getMetaContent(html, 'og:description')).toBeTruthy();
	expect(getMetaContent(html, 'twitter:title')).toBeTruthy();
	expect(getMetaContent(html, 'twitter:description')).toBeTruthy();
	expect(getCanonicalHref(html)).toContain(authorPath);
	expect(getMetaContent(html, 'robots')).toContain('index');
	expect(getMetaContent(html, 'keywords')).toBeTruthy();
});

test('author — B: JSON-LD ProfilePage y BreadcrumbList', async () => {
	const blocks = parseJsonLdBlocks(html);

	const profilePage = blocks.get(SCHEMA_IDS.profilePage);
	await assertValidJsonLd(profilePage);
	expect(profilePage?.['dateCreated']).toBeTruthy();
	expect(profilePage?.['dateModified']).toBeTruthy();
	const mainEntity = profilePage?.['mainEntity'] as Record<string, unknown>;
	expect(mainEntity?.['@type']).toBe('Person');
	expect(mainEntity?.['name']).toBeTruthy();

	const breadcrumb = blocks.get(SCHEMA_IDS.breadcrumbAuthor);
	await assertValidJsonLd(breadcrumb);
	expect((breadcrumb?.['itemListElement'] as unknown[])?.length).toBeGreaterThanOrEqual(2);
});

test('author — C: bloques sitewide Organization y WebSite presentes', async () => {
	const blocks = parseJsonLdBlocks(html);

	expect(blocks.get(SCHEMA_IDS.organization)?.['@type']).toBe('Organization');
	expect(blocks.get(SCHEMA_IDS.website)?.['@type']).toBe('WebSite');
});

test('author — invariantes de indexado para crawlers (ssr, h1, bio, sin skeleton, enlace a story)', async () => {
	expect(
		await collectIndexableHtmlViolations(html, {
			path: authorPath,
			titlePattern: /borges/i,
			requiredJsonLdIds: [...SITEWIDE_SCHEMA_IDS, SCHEMA_IDS.profilePage, SCHEMA_IDS.breadcrumbAuthor],
			requiredInternalLinkPrefix: '/story/',
		}),
	).toEqual([]);
});

test('author — D: al volver a la home se remueven los bloques del autor', async ({ page }) => {
	await page.goto(authorPath);
	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.profilePage}"]`)).toHaveCount(1);

	await page.locator('header a[href="/home"]').first().click();
	await expect(page).toHaveURL(/\/home$/);
	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.organization}"]`)).toHaveCount(1);

	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.profilePage}"]`)).toHaveCount(0);
	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.breadcrumbAuthor}"]`)).toHaveCount(0);
	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.website}"]`)).toHaveCount(1);
	await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
	await expect(page.locator('head > title')).toHaveCount(1);
});
