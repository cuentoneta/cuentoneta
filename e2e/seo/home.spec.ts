/**
 * Tests e2e de SEO para la home (`/home`).
 *
 * Sobre el HTML server-rendered (lo que ve el crawler, sin ejecutar JS):
 *  - A. Meta tags: <title> con la marca, description, og:/twitter: title y description,
 *       link canonical, robots indexable y keywords.
 *  - B+C. Datos estructurados sitewide: bloques JSON-LD Organization y WebSite (la home no
 *         tiene una entidad propia, solo los sitewide del app initializer).
 *
 * Sobre el DOM hidratado, vía navegación in-app (router):
 *  - D. Al navegar de la home a una story, los bloques sitewide persisten y aparece el Article;
 *       sin duplicar canonical ni <title>.
 */
import { test, expect } from '@playwright/test';

import { parseJsonLdBlocks, getMetaContent, getTitleText, getCanonicalHref } from '../_utils/seo';
import {
	checkNgServerContext,
	checkTitle,
	checkRobotsIndexable,
	checkPrimaryHeading,
	checkPrimaryContentLength,
	checkNoSkeletonMarkers,
	checkJsonLdBlocks,
	type Violation,
} from '../_utils/seo-invariants';
import { SCHEMA_IDS, SITEWIDE_SCHEMA_IDS } from '../_utils/seo-fixtures';

let html: string;

test.beforeAll(async ({ request }) => {
	html = await (await request.get('/home')).text();
});

test('home — A: meta tags en el HTML server-rendered', async () => {
	expect(getTitleText(html)).toContain('La Cuentoneta');
	expect(getMetaContent(html, 'description')).toBeTruthy();
	expect(getMetaContent(html, 'og:title')).toBeTruthy();
	expect(getMetaContent(html, 'og:description')).toBeTruthy();
	expect(getMetaContent(html, 'twitter:title')).toBeTruthy();
	expect(getMetaContent(html, 'twitter:description')).toBeTruthy();
	expect(getCanonicalHref(html)).toBeTruthy();
	expect(getMetaContent(html, 'robots')).toContain('index');
	expect(getMetaContent(html, 'keywords')).toContain('relatos breves');
});

test('home — B/C: bloques JSON-LD sitewide Organization y WebSite', async () => {
	const blocks = parseJsonLdBlocks(html);

	const organization = blocks.get(SCHEMA_IDS.organization);
	expect(organization?.['@context']).toBe('https://schema.org');
	expect(organization?.['@type']).toBe('Organization');
	expect(organization?.['name']).toBe('La Cuentoneta');

	const website = blocks.get(SCHEMA_IDS.website);
	expect(website?.['@context']).toBe('https://schema.org');
	expect(website?.['@type']).toBe('WebSite');
	expect(website?.['name']).toBe('La Cuentoneta');
});

test('home — invariantes de indexado para crawlers (ssr, h1 real, contenido primario, jsonld sitewide)', async () => {
	// La canónica de home apunta a la raíz del sitio (no a /home); su presencia la cubre el test A.
	const violations: Violation[] = [
		checkNgServerContext(html),
		checkTitle(html, /La Cuentoneta/),
		checkRobotsIndexable(html),
		checkPrimaryHeading(html),
		checkPrimaryContentLength(html),
		...(await checkJsonLdBlocks(html, SITEWIDE_SCHEMA_IDS)),
	].filter((violation): violation is Violation => violation !== null);
	expect(violations).toEqual([]);
});

// Bloqueado por #1771: los decks most-read/latest/collection-teasers usan @defer, así que el SSR
// sirve <cuentoneta-*-skeleton data-testid="skeleton"> dentro de <main>. Activar al cerrar #1771.
test.fixme('home — sin markers de skeleton en <main> (bloqueado por #1771)', () => {
	expect(checkNoSkeletonMarkers(html)).toBeNull();
});

test('home — D: al navegar a una story aparece el Article y el sitewide persiste', async ({ page }) => {
	await page.goto('/home');
	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.organization}"]`)).toHaveCount(1);

	await page.locator('a[href^="/story/"]').filter({ visible: true }).first().click();
	await expect(page).toHaveURL(/\/story\//);
	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.article}"]`)).toHaveCount(1);

	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.organization}"]`)).toHaveCount(1);
	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.website}"]`)).toHaveCount(1);
	await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
	await expect(page.locator('head > title')).toHaveCount(1);
});
