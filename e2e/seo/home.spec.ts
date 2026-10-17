/**
 * Tests e2e de SEO para la home (`/`).
 *
 * Sobre el HTML server-rendered (lo que ve el crawler, sin ejecutar JS):
 *  - A. Meta tags: <title> con la marca, description, og:/twitter: title y description,
 *       link canonical, robots indexable y keywords.
 *  - B+C. Datos estructurados sitewide: bloques JSON-LD Organization y WebSite (la home no
 *         tiene una entidad propia, solo los sitewide del app initializer).
 *  - E. Enlaces a los hubs del catálogo (/literary-work y /authors), que son la vía por la que
 *       el crawler alcanza el corpus.
 *
 * Sobre el DOM hidratado, vía navegación in-app (router):
 *  - D. Al navegar de la home a una obra, los bloques sitewide persisten y aparece el Article;
 *       sin duplicar canonical ni <title>.
 */
import { expect } from '@playwright/test';

import { test } from '../_utils/test';

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
	checkInternalLink,
	checkJsonLdBlocks,
	checkOgImage,
} from '../_utils/seo-invariants';
import { SCHEMA_IDS, SITEWIDE_SCHEMA_IDS } from '../_utils/seo-fixtures';

let html: string;

test.beforeAll(async ({ request }) => {
	html = await (await request.get('/')).text();
});

test('home — A: meta tags en el HTML server-rendered', async () => {
	expect(getTitleText(html)).toContain('La Cuentoneta');
	expect(getMetaContent(html, 'description')).toBeTruthy();
	expect(getMetaContent(html, 'og:title')).toBeTruthy();
	expect(getMetaContent(html, 'og:description')).toBeTruthy();
	expect(getMetaContent(html, 'twitter:title')).toBeTruthy();
	expect(getMetaContent(html, 'twitter:description')).toBeTruthy();
	// La portada es su propia canónica: una canónica hacia otra ruta le cedería lo indexado. La
	// presencia se afirma aparte porque una URL vacía también resuelve a la raíz.
	const canonical = getCanonicalHref(html);
	expect(canonical).toBeTruthy();
	expect(new URL(canonical ?? '', 'http://canonical.invalid').pathname).toBe('/');
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
// que importa es que estén sin ejecutar JS. Igualdad exacta del href: el enlace a una obra puntual
// no cuenta como enlace al hub.
test('home — E: enlaza los hubs del catálogo en el HTML server-rendered', async () => {
	const hrefs = parseHtml(html)
		.querySelectorAll('a')
		.map((anchor) => anchor.getAttribute('href'));

	expect(hrefs).toContain('/literary-work');
	expect(hrefs).toContain('/authors');
});

// La imagen por defecto no viene en el HTML estático: la declara el SSR con el host del build. Se
// afirma que resuelve contra el host que sirve la página y que el archivo existe ahí, que es lo que
// una URL fija a producción rompía en preview y staging.
test('home — imagen por defecto servida por el mismo host', async ({ request, baseURL }) => {
	const ogImage = getMetaContent(html, 'og:image') ?? '';
	expect(ogImage).toMatch(/\/assets\/img\/og-default\.jpg$/);
	expect(getMetaContent(html, 'twitter:image')).toBe(ogImage);

	const imageUrl = new URL(ogImage, baseURL);
	expect(imageUrl.origin).toBe(new URL(baseURL ?? '').origin);
	expect((await request.get(imageUrl.href)).status()).toBe(200);
});

test('home — invariantes de indexado para crawlers (ssr, h1 real, contenido primario, jsonld sitewide)', async () => {
	// La canónica la cubre el test A.
	const violations: SeoInvariantViolation[] = [
		checkNgServerContext(html),
		checkTitle(html, /La Cuentoneta/),
		checkRobotsIndexable(html),
		checkPrimaryHeading(html),
		checkPrimaryContentLength(html),
		// Que no haya esqueletos dice que los decks no difieren; que haya un enlace a una obra dice que
		// además trajeron contenido. Sin esto, una página que sirviera los decks vacíos pasaría igual.
		checkInternalLink(html, '/literary-work/'),
		checkOgImage(html),
		...(await checkJsonLdBlocks(html, SITEWIDE_SCHEMA_IDS)),
	].filter((violation): violation is SeoInvariantViolation => violation !== null);
	expect(violations).toEqual([]);
});

// `checkNgServerContext` acepta también `ssg`, y una copia prerenderizada de la portada en el build la
// serviría el servidor de estáticos antes que el render por request: quedaría congelada con el
// contenido de la semana en que se buildeó.
test('home — se renderiza por request, no desde una copia prerenderizada', () => {
	expect(parseHtml(html).querySelector('cuentoneta-root')?.getAttribute('ng-server-context')).toBe('ssr');
});

test('home — sin markers de skeleton en <main>', () => {
	expect(checkNoSkeletonMarkers(html)).toBeNull();
});

test('home — D: al navegar a una obra aparece el Article y el sitewide persiste', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.organization}"]`)).toHaveCount(1);

	await page.locator('a[href^="/literary-work/"]').filter({ visible: true }).first().click();
	await expect(page).toHaveURL(/\/literary-work\//);
	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.article}"]`)).toHaveCount(1);

	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.organization}"]`)).toHaveCount(1);
	await expect(page.locator(`script[data-schema-id="${SCHEMA_IDS.website}"]`)).toHaveCount(1);
	await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
	await expect(page.locator('head > title')).toHaveCount(1);
});
