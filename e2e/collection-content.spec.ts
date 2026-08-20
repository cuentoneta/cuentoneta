/**
 * Contenido de la página de colección: el listado de obras, la columna con la información de la colección
 * y el bloque de otras colecciones sugeridas.
 *
 * `e2e/seo/collection.spec.ts` ya mira esta ruta, pero mira el HTML que ve el crawler. Acá se ejercita la
 * página hidratada, que es lo único que alcanza las dos cosas que aquel no puede: la columna lateral, que
 * vive tras un breakpoint y por lo tanto depende del ancho real del viewport, y el bloque de sugeridas,
 * que se alimenta de un recurso progresivo y en el HTML del servidor todavía no existe.
 */
import { expect, test, type Page } from '@playwright/test';

import { DESKTOP_VIEWPORT, fetchCollectionCatalog, type CollectionCatalogEntry } from './_utils/collection-fixtures';
import { STABLE_SLUGS } from './_utils/seo-fixtures';

const ROUTE = `/collection/${STABLE_SLUGS.collection}`;

let status = 0;
let catalog: CollectionCatalogEntry[] = [];
let collection: CollectionCatalogEntry | undefined;

test.beforeAll(async ({ request }) => {
	status = (await request.get(ROUTE)).status();
	catalog = await fetchCollectionCatalog(request);
	collection = catalog.find((entry) => entry.slug === STABLE_SLUGS.collection);
});

// Guardas como casos propios, no como `skip` silencioso: un dataset sin el fixture es un problema de la
// infraestructura de test, no un motivo para que el gate quede verde sin haber mirado nada.
test('la colección estable existe en el dataset', () => {
	expect(status, `"${ROUTE}" no responde 200: los casos de la página no verifican nada`).toBe(200);
	expect(collection, `el catálogo no trae "${STABLE_SLUGS.collection}": no habría con qué comparar`).toBeDefined();
});

test('el catálogo ofrece otra colección además de la que se lee', () => {
	expect(
		catalog.length,
		'el catálogo trae una sola colección: el bloque de sugeridas no tendría qué mostrar',
	).toBeGreaterThan(1);
});

/** Abre la ruta en un ancho donde la columna lateral existe, con el contenido ya resuelto. */
async function openCollection(page: Page): Promise<void> {
	await page.setViewportSize(DESKTOP_VIEWPORT);
	await page.goto(ROUTE);
	await expect(page.locator('main h1')).toBeVisible();
}

test('el listado muestra las obras de la colección y cada una lleva a su lectura', async ({ page }) => {
	// eslint-disable-next-line playwright/no-skipped-test -- la ausencia del fixture ya la reporta la guarda de arriba; repetirla acá sería el mismo fallo dos veces
	test.skip(status !== 200, `"${ROUTE}" no responde 200 en el dataset`);

	await openCollection(page);

	const cards = page.getByTestId('literary-works').locator('cuentoneta-literary-work-card-teaser');

	// Control positivo: sin él, un listado vacío dejaría la aserción de destinos cumpliéndose en vacío.
	await expect(cards.first()).toBeVisible();

	// Se cuentan los enlaces a la lectura contra las tarjetas y no se afirma que *todos* los enlaces del
	// listado lleven ahí: la tarjeta enlaza además al autor cuando la curaduría lo muestra.
	const readingLinks = page.getByTestId('literary-works').locator('a[href^="/read/"]');
	expect(await readingLinks.count(), 'alguna obra del listado no ofrece su lectura').toBe(await cards.count());

	// Cada tarjeta lleva a *su* obra: sin esto, N enlaces al mismo destino darían el mismo conteo.
	const destinations = await readingLinks.evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
	expect(new Set(destinations).size, `hay obras que comparten destino: ${destinations}`).toBe(destinations.length);
});

test('la columna muestra la información de la colección', async ({ page }) => {
	// eslint-disable-next-line playwright/no-skipped-test -- la ausencia del fixture ya la reporta la guarda de arriba; repetirla acá sería el mismo fallo dos veces
	test.skip(status !== 200 || !collection, `"${ROUTE}" no responde 200 en el dataset`);

	await openCollection(page);

	// El título sale del catálogo y no de una constante: el spec afirma que la página muestra la colección
	// que el API dice que es, no que muestre un texto que el propio spec eligió.
	await expect(page.locator('main h1')).toHaveText(collection?.title ?? '');

	const info = page.getByTestId('collection-info');
	await expect(info.locator('cuentoneta-collection-cover')).toBeVisible();

	// Scopeado a la columna: `description` también rotula el extracto de cada tarjeta de obra.
	await expect(info.getByTestId('description')).not.toBeEmpty();
});

// Que el bloque exista prueba además que el recurso progresivo del catálogo resolvió en el cliente: en el
// HTML del servidor no está.
test('la columna ofrece otras colecciones y ninguna es la que se está leyendo', async ({ page }) => {
	// eslint-disable-next-line playwright/no-skipped-test -- la ausencia del fixture ya la reporta la guarda de arriba; repetirla acá sería el mismo fallo dos veces
	test.skip(status !== 200 || catalog.length < 2, `"${ROUTE}" no responde 200 en el dataset`);

	await openCollection(page);

	const info = page.getByTestId('collection-info');
	await expect(info.getByRole('heading', { name: 'Otras colecciones sugeridas' })).toBeVisible();

	const suggested = info.getByTestId('suggested-collection').getByRole('link');
	await expect(suggested.first()).toBeVisible();

	const destinations = await suggested.evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
	expect(
		destinations.every((href) => href.startsWith('/collection/')),
		`destinos ajenos: ${destinations}`,
	).toBe(true);
	expect(destinations, 'la colección que se está leyendo se ofrece a sí misma').not.toContain(ROUTE);
});
