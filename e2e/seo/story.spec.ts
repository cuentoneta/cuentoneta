/**
 * Tests e2e de SEO para la página de cuento (`/story/:slug`).
 *
 * Sobre el HTML server-rendered (lo que ve el crawler, sin ejecutar JS):
 *  - A. Meta tags: <title> con el cuento, description, og:/twitter: title y description,
 *       canonical a la URL del cuento, robots indexable, keywords y author (señal E-E-A-T).
 *  - B. Datos estructurados: JSON-LD Article (headline, author Person, datePublished,
 *       dateModified, publisher Organization) y BreadcrumbList.
 *  - C. Bloques sitewide Organization y WebSite.
 *
 * Sobre el DOM hidratado, vía navegación in-app (router):
 *  - D. Al navegar del cuento al autor, los bloques del cuento (Article + breadcrumb) se
 *       remueven y aparecen los del autor; sin duplicar canonical ni <title>.
 */
import { test, expect } from '@playwright/test';

import { parseJsonLdBlocks, getMetaContent, getTitleText, getCanonicalHref } from '../_utils/seo';
import { collectIndexableHtmlViolations } from '../_utils/seo-invariants';
import { STABLE_SLUGS, SCHEMA_IDS, SITEWIDE_SCHEMA_IDS } from '../_utils/seo-fixtures';

const storyPath = `/story/${STABLE_SLUGS.story}`;

let html: string;

test.beforeAll(async ({ request }) => {
	html = await (await request.get(storyPath)).text();
});

test('story — A: meta tags en el HTML server-rendered', async () => {
	expect(getTitleText(html)).toMatch(/aleph/i);
	expect(getMetaContent(html, 'description')).toBeTruthy();
	expect(getMetaContent(html, 'og:title')).toBeTruthy();
	expect(getMetaContent(html, 'og:description')).toBeTruthy();
	expect(getMetaContent(html, 'twitter:title')).toBeTruthy();
	expect(getMetaContent(html, 'twitter:description')).toBeTruthy();
	expect(getCanonicalHref(html)).toContain(storyPath);
	expect(getMetaContent(html, 'robots')).toContain('index');
	expect(getMetaContent(html, 'keywords')).toBeTruthy();
	expect(getMetaContent(html, 'author')).toBeTruthy();
});

test('story — B: JSON-LD Article y BreadcrumbList', async () => {
	const blocks = parseJsonLdBlocks(html);

	const article = blocks.get(SCHEMA_IDS.article);
	expect(article?.['@context']).toBe('https://schema.org');
	expect(article?.['@type']).toBe('Article');
	expect(article?.['headline']).toBeTruthy();
	expect(article?.['datePublished']).toBeTruthy();
	expect(article?.['dateModified']).toBeTruthy();
	expect((article?.['author'] as Record<string, unknown>)?.['@type']).toBe('Person');
	expect((article?.['publisher'] as Record<string, unknown>)?.['@type']).toBe('Organization');

	const breadcrumb = blocks.get(SCHEMA_IDS.breadcrumbStory);
	expect(breadcrumb?.['@context']).toBe('https://schema.org');
	expect(breadcrumb?.['@type']).toBe('BreadcrumbList');
	expect((breadcrumb?.['itemListElement'] as unknown[])?.length).toBeGreaterThanOrEqual(2);
});

test('story — C: bloques sitewide Organization y WebSite presentes', async () => {
	const blocks = parseJsonLdBlocks(html);

	expect(blocks.get(SCHEMA_IDS.organization)?.['@type']).toBe('Organization');
	expect(blocks.get(SCHEMA_IDS.website)?.['@type']).toBe('WebSite');
});

test('story — invariantes de indexado para crawlers (ssr, h1, contenido primario, sin skeleton, enlace a autor)', async () => {
	expect(
		await collectIndexableHtmlViolations(html, {
			path: storyPath,
			titlePattern: /aleph/i,
			h1Pattern: /aleph/i,
			requiredJsonLdIds: [...SITEWIDE_SCHEMA_IDS, SCHEMA_IDS.article, SCHEMA_IDS.breadcrumbStory],
			requiredInternalLinkPrefix: '/author/',
		}),
	).toEqual([]);
});

test('story — D: al navegar al autor se remueven los bloques del cuento', async ({ page }) => {
	await page.goto(storyPath);
	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.article}"]`)).toHaveCount(1);

	// El-aleph es de Borges: la ficha del cuento enlaza a /author/jorge-luis-borges.
	await page.locator(`a[href="/author/${STABLE_SLUGS.author}"]`).filter({ visible: true }).first().click();
	await expect(page).toHaveURL(/\/author\//);
	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.profilePage}"]`)).toHaveCount(1);

	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.article}"]`)).toHaveCount(0);
	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.breadcrumbStory}"]`)).toHaveCount(0);
	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.breadcrumbAuthor}"]`)).toHaveCount(1);
	await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
	await expect(page.locator('head > title')).toHaveCount(1);
});
