/**
 * Tests e2e de SEO para la home (`/home`).
 *
 * Sobre el HTML server-rendered (lo que ve el crawler, sin ejecutar JS):
 *  - A. Meta tags: <title> con la marca, description, og:/twitter: title y description,
 *       link canonical, robots indexable y keywords.
 *  - B+C. Datos estructurados sitewide: bloques JSON-LD Organization y WebSite (la home no
 *         tiene una entidad propia, solo los sitewide del app initializer).
 *  - E. Enlaces a los hubs del catálogo (/story y /authors), que son la vía por la que el
 *       crawler alcanza el corpus.
 *
 * Sobre el DOM hidratado, vía navegación in-app (router):
 *  - D. Al navegar de la home a una story, los bloques sitewide persisten y aparece el Article;
 *       sin duplicar canonical ni <title>.
 */
import { test, expect } from '@playwright/test';

import { parseHtml, parseJsonLdBlocks, getMetaContent, getTitleText, getCanonicalHref } from '../_utils/seo';
import { assertValidJsonLd } from '@testing/json-ld-validation';
import type { SeoInvariantViolation } from '@testing/seo-invariant-violation';
import {
	checkNgServerContext,
	checkTitle,
	checkRobotsIndexable,
	checkPrimaryHeading,
	checkPrimaryContentLength,
	checkNoSkeletonMarkers,
	checkJsonLdBlocks,
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
	await assertValidJsonLd(organization);
	expect(organization?.['name']).toBe('La Cuentoneta');

	const website = blocks.get(SCHEMA_IDS.website);
	await assertValidJsonLd(website);
	expect(website?.['name']).toBe('La Cuentoneta');
});

// Los hubs concentran los enlaces a todo el corpus, y hasta este cambio ninguna página los
// enlazaba: el crawler solo los conocía por el sitemap. Se afirma sobre el HTML crudo porque lo
// que importa es que estén sin ejecutar JS. Igualdad exacta del href: /story/<slug> no cuenta.
test('home — E: enlaza los hubs del catálogo en el HTML server-rendered', async () => {
	const hrefs = parseHtml(html)
		.querySelectorAll('a')
		.map((anchor) => anchor.getAttribute('href'));

	expect(hrefs).toContain('/story');
	expect(hrefs).toContain('/authors');
});

test('home — invariantes de indexado para crawlers (ssr, h1 real, contenido primario, jsonld sitewide)', async () => {
	// La canónica de home apunta a la raíz del sitio (no a /home); su presencia la cubre el test A.
	const violations: SeoInvariantViolation[] = [
		checkNgServerContext(html),
		checkTitle(html, /La Cuentoneta/),
		checkRobotsIndexable(html),
		checkPrimaryHeading(html),
		checkPrimaryContentLength(html),
		...(await checkJsonLdBlocks(html, SITEWIDE_SCHEMA_IDS)),
	].filter((violation): violation is SeoInvariantViolation => violation !== null);
	expect(violations).toEqual([]);
});

// Bloqueado: los decks most-read/latest/collection-teasers usan @defer, así que el SSR sirve
// <cuentoneta-*-skeleton data-testid="skeleton"> dentro de <main>. Activar cuando esos decks se
// server-rendericen sin diferir.
test.fixme('home — sin markers de skeleton en <main>', () => {
	expect(checkNoSkeletonMarkers(html)).toBeNull();
});

// La home ya no emite ningún enlace `/story/`: sus tarjetas destacadas navegan a la ruta de lectura y
// sus colecciones a `/collection/`. `ReadPage` emite el mismo Article, así que el invariante que este
// caso afirma se conserva; lo que cambia es por dónde se llega.
test('home — D: al navegar a una obra aparece el Article y el sitewide persiste', async ({ page }) => {
	await page.goto('/home');
	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.organization}"]`)).toHaveCount(1);

	await page.locator('a[href^="/read/"]').filter({ visible: true }).first().click();
	await expect(page).toHaveURL(/\/read\//);
	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.article}"]`)).toHaveCount(1);

	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.organization}"]`)).toHaveCount(1);
	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.website}"]`)).toHaveCount(1);
	await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
	await expect(page.locator('head > title')).toHaveCount(1);
});
