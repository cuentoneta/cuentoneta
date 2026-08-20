/**
 * Acceso a la descripción completa de una colección y cierre del panel que la muestra.
 *
 * Es lo único de la suite que mide el desborde real del recorte. El spec unitario de `ClampOverflowDirective`
 * le fija las medidas a mano porque happy-dom no computa layout, así que la aparición del control —que
 * depende de que ocho líneas no alcancen para el texto— solo se puede afirmar en un navegador de verdad.
 *
 * La colección que se lee acá no es la estable: es la de descripción más larga del catálogo, que es la
 * única con chances de desbordar. Ver `_utils/collection-fixtures.ts`.
 */
import { expect, test, type Locator, type Page } from '@playwright/test';

import {
	DESKTOP_VIEWPORT,
	fetchCollectionCatalog,
	pickMostDescriptiveCollection,
	type CollectionCatalogEntry,
} from './_utils/collection-fixtures';

const READ_MORE = 'Leer más';

// Holgado a propósito: el `beforeAll` corre una sola vez y su veredicto decide si los casos del panel
// corren o se saltean, así que conviene esperar de más antes que declarar ausente un contenido que está.
const FIXTURE_TIMEOUT = 15_000;

let mostDescriptive: CollectionCatalogEntry | undefined;
let readMoreIsVisible = false;

test.beforeAll(async ({ request, browser }) => {
	mostDescriptive = pickMostDescriptiveCollection(await fetchCollectionCatalog(request));
	if (!mostDescriptive) {
		return;
	}

	// El estado del fixture se resuelve una sola vez: sin esto, una curaduría de descripciones cortas
	// produciría el mismo fallo en cada uno de los casos de abajo en vez de una vez, acá.
	const page = await browser.newPage({ viewport: DESKTOP_VIEWPORT });
	await page.goto(`/collection/${mostDescriptive.slug}`);
	const readMore = page.getByTestId('collection-info').getByRole('button', { name: READ_MORE });
	// Se espera al control en vez de preguntar si está: el recorte se mide después de hidratar, así que una
	// lectura instantánea devuelve "no desborda" en una página que todavía no terminó de resolverse. Solo
	// el vencimiento del plazo significa que el contenido no da.
	readMoreIsVisible = await readMore
		.waitFor({ state: 'visible', timeout: FIXTURE_TIMEOUT })
		.then(() => true)
		.catch(() => false);
	await page.close();
});

// Guardas como casos propios, no como `skip` silencioso: un dataset sin el fixture es un problema de la
// infraestructura de test, no un motivo para que el gate quede verde sin haber mirado nada.
test('el catálogo trae alguna colección con descripción', () => {
	expect(mostDescriptive, 'ninguna colección del catálogo tiene descripción: no habría qué recortar').toBeDefined();
});

// Es a la vez la guarda de los casos del panel y la primera mitad de la tarea que los motiva: que el
// acceso a la descripción completa aparezca cuando el texto desborda su recorte.
test('alguna colección desborda el recorte de ocho líneas y ofrece leerla entera', () => {
	expect(
		readMoreIsVisible,
		`la descripción más larga del catálogo ("${mostDescriptive?.slug}") no desborda el recorte: los casos del panel no verificarían nada`,
	).toBe(true);
});

/** Abre la ruta y despliega el panel con la descripción completa. */
async function openDescriptionDrawer(page: Page): Promise<Locator> {
	await page.setViewportSize(DESKTOP_VIEWPORT);
	await page.goto(`/collection/${mostDescriptive?.slug}`);
	await page.getByTestId('collection-info').getByRole('button', { name: READ_MORE }).click();

	const drawer = page.getByRole('dialog');
	await expect(drawer).toBeVisible();
	await settleIn(drawer);
	return drawer;
}

/**
 * Espera a que el panel llegue a su posición de entrada.
 *
 * No alcanza con que esté visible ni con que lleve `data-open`: ese atributo dispara la transición, no la
 * termina, y durante los 300 ms que dura el panel está en el documento pero todavía corrido fuera de la
 * pantalla. Actuar ahí mide una caja que no es la que se ve y, si además se interrumpe la transición, el
 * cierre queda esperando un `transitionend` que ya no llega.
 */
/** La caja que ocupa el panel, para elegir un punto que quede fuera de ella. */
async function panelBox(drawer: Locator) {
	const box = await drawer.boundingBox();
	if (!box) {
		throw new Error('El panel no ocupa lugar: no habría caja de la cual quedar afuera');
	}
	return box;
}

async function settleIn(drawer: Locator): Promise<void> {
	await expect
		.poll(async () => (await drawer.boundingBox())?.x ?? Number.POSITIVE_INFINITY, {
			message: 'el panel no llegó a entrar en la pantalla',
		})
		.toBeLessThan(DESKTOP_VIEWPORT.width);
}

test('el panel muestra la descripción completa', async ({ page }) => {
	// eslint-disable-next-line playwright/no-skipped-test -- la ausencia del fixture ya la reportan las guardas de arriba; repetirla acá sería el mismo fallo dos veces
	test.skip(!readMoreIsVisible, 'ninguna colección del dataset desborda el recorte');

	const drawer = await openDescriptionDrawer(page);

	// Se compara el marcado y no el texto: la descripción llega saneada desde el backend y el panel la
	// pinta tal cual, así que la igualdad afirma a la vez que se muestra entera —el recorte de la columna
	// es visual, y un `toContainText` pasaría igual con las ocho líneas— y que conserva su prosa.
	const shown = await drawer.getByTestId('description').innerHTML();
	expect(shown).toBe(mostDescriptive?.description);
});

// El cierre se afirma con `toBeHidden` y no leyendo el atributo `open`: el drawer llama a `close()` recién
// al terminar la transición, así que el elemento sigue abierto durante los 300 ms que dura.
test('el panel se cierra con el botón de cierre', async ({ page }) => {
	// eslint-disable-next-line playwright/no-skipped-test -- la ausencia del fixture ya la reportan las guardas de arriba; repetirla acá sería el mismo fallo dos veces
	test.skip(!readMoreIsVisible, 'ninguna colección del dataset desborda el recorte');

	const drawer = await openDescriptionDrawer(page);
	await drawer.getByRole('button', { name: 'Cerrar' }).click();

	await expect(drawer).toBeHidden();
});

test('el panel se cierra con Escape', async ({ page }) => {
	// eslint-disable-next-line playwright/no-skipped-test -- la ausencia del fixture ya la reportan las guardas de arriba; repetirla acá sería el mismo fallo dos veces
	test.skip(!readMoreIsVisible, 'ninguna colección del dataset desborda el recorte');

	const drawer = await openDescriptionDrawer(page);
	await page.keyboard.press('Escape');

	await expect(drawer).toBeHidden();
});

test('el panel se cierra al hacer clic fuera', async ({ page }) => {
	// eslint-disable-next-line playwright/no-skipped-test -- la ausencia del fixture ya la reportan las guardas de arriba; repetirla acá sería el mismo fallo dos veces
	test.skip(!readMoreIsVisible, 'ninguna colección del dataset desborda el recorte');

	const drawer = await openDescriptionDrawer(page);
	const box = await panelBox(drawer);

	// El panel entra por la derecha, así que el margen izquierdo del viewport es backdrop. El control
	// positivo descarta que el punto elegido caiga sobre el panel, que cerraría por otro motivo —el botón,
	// por ejemplo— y daría el mismo verde sin haber probado el backdrop.
	const outsideX = box.x / 2;
	const outsideY = DESKTOP_VIEWPORT.height / 2;
	expect(outsideX, 'el punto elegido cae dentro del panel: el clic no probaría el backdrop').toBeLessThan(box.x);

	await page.mouse.click(outsideX, outsideY);

	await expect(drawer).toBeHidden();
});
