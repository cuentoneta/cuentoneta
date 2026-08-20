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
test('collection — la colección estable existe en el dataset', () => {
	expect(status, `"${ROUTE}" no responde 200: los casos de la página no verifican nada`).toBe(200);
	expect(collection, `el catálogo no trae "${STABLE_SLUGS.collection}": no habría con qué comparar`).toBeDefined();
});

test('collection — el catálogo ofrece otra colección además de la que se lee', () => {
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

test('collection — el listado muestra las obras y cada una lleva a su lectura', async ({ page }) => {
	// eslint-disable-next-line playwright/no-skipped-test -- la ausencia del fixture ya la reporta la guarda de arriba; repetirla acá sería el mismo fallo dos veces
	test.skip(status !== 200, `"${ROUTE}" no responde 200 en el dataset`);

	await openCollection(page);

	const cards = page.getByTestId('literary-works').locator('cuentoneta-literary-work-card-teaser');

	// Control positivo: sin él, un listado vacío dejaría la aserción de destinos cumpliéndose en vacío.
	await expect(cards.first()).toBeVisible();

	// Se cuentan los enlaces a la lectura contra las tarjetas y no se afirma que *todos* los enlaces del
	// listado lleven ahí: la tarjeta enlaza además al autor cuando la curaduría lo muestra.
	const readingLinks = page.getByTestId('literary-works').locator('a[href^="/read/"]');
	await expect(readingLinks, 'alguna obra del listado no ofrece su lectura').toHaveCount(await cards.count());

	// Cada tarjeta lleva a *su* obra: sin esto, N enlaces al mismo destino darían el mismo conteo.
	const destinations = await readingLinks.evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
	expect(new Set(destinations).size, `hay obras que comparten destino: ${destinations}`).toBe(destinations.length);
});

test('collection — la columna muestra la información de la colección', async ({ page }) => {
	// eslint-disable-next-line playwright/no-skipped-test -- la ausencia del fixture ya la reporta la guarda de arriba; repetirla acá sería el mismo fallo dos veces
	test.skip(status !== 200, `"${ROUTE}" no responde 200 en el dataset`);
	// Separado del anterior y no unido por `||`: un motivo compuesto reporta siempre el primero, y quien
	// lea el resultado diagnosticaría un 404 donde lo que falta es la entrada del catálogo.
	// eslint-disable-next-line playwright/no-skipped-test -- ídem
	test.skip(!collection, `el catálogo no trae "${STABLE_SLUGS.collection}"`);

	await openCollection(page);

	// El título sale del catálogo y no de una constante: el spec afirma que la página muestra la colección
	// que el API dice que es, no que muestre un texto que el propio spec eligió.
	await expect(page.locator('main h1')).toHaveText(collection?.title ?? '');

	const info = page.getByTestId('collection-info');
	await expect(info.locator('cuentoneta-collection-cover')).toBeVisible();

	// Scopeado a la columna: `description` también rotula el extracto de cada tarjeta de obra.
	await expect(info.getByTestId('description')).not.toBeEmpty();
});

// El panel de la descripción existe en la plantilla desde el primer render, y hasta que alguien lo abra no
// debe aportar nada a la página. Se mira su botón de cierre porque es lo único que el panel trae siempre:
// el resto de su contenido está gateado, así que un panel indebidamente presente pasaría inadvertido.
test('collection — el panel de la descripción no aporta nada antes de abrirse', async ({ page }) => {
	// eslint-disable-next-line playwright/no-skipped-test -- la ausencia del fixture ya la reporta la guarda de arriba; repetirla acá sería el mismo fallo dos veces
	test.skip(status !== 200, `"${ROUTE}" no responde 200 en el dataset`);

	await openCollection(page);

	await expect(page.getByRole('button', { name: 'Cerrar' })).toHaveCount(0);
});

// Que el bloque exista prueba además que el recurso progresivo del catálogo resolvió en el cliente: en el
// HTML del servidor no está.
test('collection — la columna ofrece otras colecciones y ninguna es la que se está leyendo', async ({ page }) => {
	// eslint-disable-next-line playwright/no-skipped-test -- la ausencia del fixture ya la reporta la guarda de arriba; repetirla acá sería el mismo fallo dos veces
	test.skip(status !== 200, `"${ROUTE}" no responde 200 en el dataset`);
	// eslint-disable-next-line playwright/no-skipped-test -- ídem
	test.skip(catalog.length < 2, 'el catálogo trae una sola colección: no hay otra que ofrecer');

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
