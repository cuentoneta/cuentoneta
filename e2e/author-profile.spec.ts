/**
 * Acceso a la biografía completa del autor y comportamiento de la columna de perfil al scrollear.
 *
 * Son los dos comportamientos de la página que ningún otro gate alcanza: el desborde del recorte depende
 * de medidas reales —el spec unitario se las fija a mano porque happy-dom no computa layout— y el sticky
 * no existe fuera de un navegador con viewport.
 */
import { expect } from '@playwright/test';

import { test } from './_utils/test';

import { STABLE_SLUGS } from './_utils/seo-fixtures';
import { DESKTOP_VIEWPORT } from './_utils/viewports';

const READ_MORE = 'Leer más';
const authorPath = `/author/${STABLE_SLUGS.author}`;

// Holgado a propósito: el `beforeAll` corre una sola vez y su veredicto decide si el caso del panel corre
// o se saltea, así que conviene esperar de más antes que declarar ausente un contenido que está.
const FIXTURE_TIMEOUT = 15_000;

let readMoreIsVisible = false;

test.beforeAll(async ({ browser }) => {
	// El estado del fixture se resuelve una sola vez: sin esto, una biografía corta produciría el mismo
	// fallo en cada caso de abajo en vez de una vez, acá.
	const page = await browser.newPage({ viewport: DESKTOP_VIEWPORT });
	await page.goto(authorPath);
	// Se espera al control en vez de preguntar si está: el recorte se mide después de hidratar, así que
	// una lectura instantánea devuelve "no desborda" en una página que todavía no terminó de resolverse.
	readMoreIsVisible = await page
		.getByTestId('author-info')
		.getByRole('button', { name: READ_MORE })
		.waitFor({ state: 'visible', timeout: FIXTURE_TIMEOUT })
		.then(() => true)
		.catch(() => false);
	await page.close();
});

// Guarda como caso propio, no como `skip` silencioso: un dataset sin el fixture es un problema de la
// infraestructura de test, no un motivo para que el gate quede verde sin haber mirado nada.
test('author — la biografía del autor estable desborda el recorte y ofrece leerla entera', () => {
	expect(
		readMoreIsVisible,
		`la biografía de "${STABLE_SLUGS.author}" no desborda el recorte: el caso del panel no verificaría nada`,
	).toBe(true);
});

test('author — el panel muestra la biografía completa', async ({ page }) => {
	// eslint-disable-next-line playwright/no-skipped-test -- la ausencia del fixture ya la reporta la guarda de arriba; repetirla acá sería el mismo fallo dos veces
	test.skip(!readMoreIsVisible, 'la biografía del autor estable no desborda el recorte');

	await page.setViewportSize(DESKTOP_VIEWPORT);
	await page.goto(authorPath);
	const columnBiography = await page.getByTestId('author-info').getByTestId('biography').innerHTML();

	await page.getByTestId('author-info').getByRole('button', { name: READ_MORE }).click();
	const drawer = page.getByRole('dialog');
	await expect(drawer).toBeVisible();

	// Se compara el marcado y no el texto: la biografía llega saneada del backend y el panel la pinta tal
	// cual, así que la igualdad afirma que el panel muestra lo mismo que la columna recorta visualmente.
	// El recorte de la columna es visual, de modo que un `toContainText` pasaría igual con ocho líneas.
	expect(await drawer.getByTestId('biography').innerHTML()).toBe(columnBiography);
});

test('author — la columna de perfil acompaña el scroll del listado', async ({ page }) => {
	await page.setViewportSize(DESKTOP_VIEWPORT);
	await page.goto(authorPath);

	const profileColumn = page.getByTestId('author-info');
	const scrolled = 1500;

	// El listado tiene que dar para scrollear tanto: si la página entra entera, la columna no se movería y
	// el caso pasaría sin haber probado el sticky.
	const scrollableHeight = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
	expect(scrollableHeight, 'la página no tiene scroll: el caso no probaría nada').toBeGreaterThan(scrolled);

	// `mouse.wheel` no mueve el documento en Firefox, así que el scroll se pide por API: lo que el caso
	// mide es dónde queda la columna, no cómo se llegó hasta ahí.
	await page.evaluate((to) => window.scrollTo(0, to), scrolled);
	await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(scrolled);

	// La posición esperada sale del token, no de un literal: así el caso también atrapa un desfasaje entre
	// el `top-*` de la columna y el alto real del encabezado fijo, no solo la ausencia del sticky.
	const headerHeight = await page.evaluate(() =>
		parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--spacing-header-height')),
	);
	expect(headerHeight, 'el token del alto del encabezado no resuelve a un número').toBeGreaterThan(0);

	// `boundingBox` es relativo al viewport: sin sticky la columna se habría ido con el flujo y su tope
	// estaría muy por encima de cero. Pegada, queda justo bajo el encabezado.
	const box = await profileColumn.boundingBox();
	expect(box?.y, 'la columna de perfil no quedó pegada bajo el encabezado fijo').toBeCloseTo(headerHeight, 0);
});
