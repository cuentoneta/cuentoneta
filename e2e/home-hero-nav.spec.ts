/**
 * La barra de navegación sobre la banda del hero de la página de inicio.
 *
 * La barra suelta su fondo —y el color de su borde— mientras la banda sigue en cuadro, y los recupera
 * apenas la deja atrás. Lo que se mide no es la clase emitida, que pasaría igual con el fondo puesto,
 * sino lo que el navegador computa para pintar la barra y la geometría con la que la banda la cubre.
 */
import { expect, type Page } from '@playwright/test';

import { test } from './_utils/test';
import { STACKING_VIEWPORTS, VIEWPORT_HEIGHT } from './_utils/stacking';

const ROUTE = '/';
// Una ruta sin banda: la barra no tiene de dónde sacar su fondo ahí, así que lo pinta siempre.
const ROUTE_WITHOUT_BAND = '/authors';

const NAV_SELECTOR = 'cuentoneta-header';
// La franja que colapsa, que es la que mide el alto visible de la barra: el host suma el píxel de su
// borde y quedaría con alto 1 aun retraída.
const BANNER_SELECTOR = `${NAV_SELECTOR} header`;
const BAND_SELECTOR = 'cuentoneta-home-hero';

const SCROLL_STEP = 300;
// Margen con el que el sondeo da la banda por pasada: en el borde exacto del viewport la intersección es
// el caso ambiguo del observer, y el fondo tendría que leerse ya con la banda fuera de cuadro.
const PAST_BAND_MARGIN = 2 * SCROLL_STEP;

const OPAQUE_BACKGROUND = 'rgb(250, 250, 250)';
const OPAQUE_BORDER = 'rgb(229, 229, 229)';
const NO_PAINT = 'rgba(0, 0, 0, 0)';

type NavPaintReport = {
	scrollY: number;
	/** Alto de la franja que colapsa: cero es la barra retraída. */
	bannerHeight: number;
	backgroundColor: string;
	borderBottomColor: string;
	/** Ancho del borde: la caja que la barra reserva en los dos estados. */
	borderBottomWidth: string;
	/** Coordenada de documento del título: si la barra entrara en el flujo, se movería. */
	headingTop: number;
};

/** Lo que el navegador computa para pintar la barra. */
async function navPaintReport(page: Page): Promise<NavPaintReport> {
	return page.evaluate(
		({ nav, banner }) => {
			const navElement = document.querySelector(nav);
			const bannerElement = document.querySelector(banner);
			const heading = document.querySelector('h1');
			if (!navElement || !bannerElement || !heading) {
				throw new Error('Falta la barra o el título: el caso no mediría lo que afirma');
			}
			const navStyle = getComputedStyle(navElement);
			return {
				scrollY: window.scrollY,
				bannerHeight: bannerElement.getBoundingClientRect().height,
				backgroundColor: getComputedStyle(bannerElement).backgroundColor,
				borderBottomColor: navStyle.borderBottomColor,
				borderBottomWidth: navStyle.borderBottomWidth,
				headingTop: heading.getBoundingClientRect().top + window.scrollY,
			};
		},
		{ nav: NAV_SELECTOR, banner: BANNER_SELECTOR },
	);
}

/** Caja de la banda del hero en la ventana, que es lo que la vuelve —o no— una franja bajo la barra. */
async function bandBox(page: Page): Promise<{ top: number; bottom: number }> {
	return page.evaluate((band) => {
		const element = document.querySelector(band);
		if (!element) {
			throw new Error('La página no montó la banda del hero: el caso no mediría lo que afirma');
		}
		const box = element.getBoundingClientRect();
		return { top: box.top, bottom: box.bottom };
	}, BAND_SELECTOR);
}

/** Abre la ruta en el ancho del caso y con el layout asentado: las fuentes tardías cambian el alto de la banda. */
async function openRoute(page: Page, route: string, width: number): Promise<void> {
	await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
	await page.goto(route);
	await expect(page.locator('h1').first()).toBeVisible();
	await page.evaluate(async () => {
		await document.fonts.ready;
	});
}

const statuses = new Map<string, number>();

test.beforeAll(async ({ request }) => {
	for (const route of [ROUTE, ROUTE_WITHOUT_BAND]) {
		statuses.set(route, (await request.get(route)).status());
	}
});

// Guardas como casos propios, no como `skip` silencioso: un dataset que no sirve una ruta es un problema
// de la infraestructura de test, no un motivo para que el gate quede verde sin haber mirado nada.
for (const route of [ROUTE, ROUTE_WITHOUT_BAND]) {
	test(`${route} responde 200`, () => {
		expect(statuses.get(route), `"${route}" no responde 200: sus casos no verifican nada`).toBe(200);
	});
}

for (const viewport of STACKING_VIEWPORTS) {
	test(`home — la barra no pinta fondo mientras la banda la cubre en el viewport ${viewport.name}`, async ({
		page,
	}) => {
		// eslint-disable-next-line playwright/no-skipped-test -- la ausencia de la portada ya la reporta su guarda; repetirla acá sería el mismo fallo una vez por ancho
		test.skip(statuses.get(ROUTE) !== 200, `"${ROUTE}" no responde 200 en el dataset`);

		await openRoute(page, ROUTE, viewport.width);
		const nav = await navPaintReport(page);
		const band = await bandBox(page);

		// Controles positivos: sin la banda delante de la barra —y con la barra retraída— "no pinta fondo"
		// se cumpliría igual, y el caso no diría nada sobre la continuidad de la banda.
		expect(nav.scrollY).toBe(0);
		expect(nav.bannerHeight).toBeGreaterThan(0);
		expect(band.top).toBeLessThanOrEqual(0);
		expect(band.bottom).toBeGreaterThan(nav.bannerHeight);

		expect(nav.backgroundColor).toBe(NO_PAINT);
		expect(nav.borderBottomColor).toBe(NO_PAINT);
	});

	test(`home — la barra sigue sin fondo mientras se scrollea sobre la banda en el viewport ${viewport.name}`, async ({
		page,
	}) => {
		// eslint-disable-next-line playwright/no-skipped-test -- la ausencia de la portada ya la reporta su guarda; repetirla acá sería el mismo fallo una vez por ancho
		test.skip(statuses.get(ROUTE) !== 200, `"${ROUTE}" no responde 200 en el dataset`);

		await openRoute(page, ROUTE, viewport.width);
		const initial = await bandBox(page);
		// La mitad de la banda: sigue cubriendo la barra y el punto está a mitad de camino de su salida, sin
		// depender del alto que la banda tenga en cada ancho.
		await page.evaluate((offset) => window.scrollTo(0, offset), Math.round(initial.bottom / 2));
		const nav = await navPaintReport(page);
		const band = await bandBox(page);

		expect(nav.scrollY).toBeGreaterThan(0);
		expect(nav.bannerHeight).toBeGreaterThan(0);
		expect(band.bottom).toBeGreaterThan(nav.bannerHeight);

		expect(nav.backgroundColor).toBe(NO_PAINT);
	});

	test(`home — la barra recupera su fondo al dejar la banda atrás en el viewport ${viewport.name}`, async ({
		page,
	}) => {
		// eslint-disable-next-line playwright/no-skipped-test -- la ausencia de la portada ya la reporta su guarda; repetirla acá sería el mismo fallo una vez por ancho
		test.skip(statuses.get(ROUTE) !== 200, `"${ROUTE}" no responde 200 en el dataset`);

		await openRoute(page, ROUTE, viewport.width);
		const before = await navPaintReport(page);

		// Se scrollea desde adentro del sondeo, en tramos siempre hacia abajo: el servicio descarta los
		// eventos que llegan demasiado seguidos, y cuántos hacen falta depende de la máquina.
		await expect
			.poll(
				async () => {
					const { bottom } = await bandBox(page);
					if (bottom > -PAST_BAND_MARGIN) {
						await page.evaluate((step) => window.scrollBy(0, step), SCROLL_STEP);
					}
					return bottom;
				},
				{ message: 'la banda no salió de cuadro: el caso no probaría el fondo recuperado' },
			)
			.toBeLessThan(0);

		// El fondo vuelve por el observer, que entrega su veredicto después del scroll: sin esperarlo, la
		// lectura caería sobre el estado anterior.
		await expect
			.poll(async () => (await navPaintReport(page)).backgroundColor, {
				message: 'la barra no recuperó su fondo con la banda ya atrás',
			})
			.toBe(OPAQUE_BACKGROUND);

		const after = await navPaintReport(page);
		const band = await bandBox(page);

		expect(band.bottom).toBeLessThan(0);
		expect(after.borderBottomColor).toBe(OPAQUE_BORDER);

		// El cambio de estado no reflowea: el ancho del borde —que viaja con el color, no con la caja— y la
		// coordenada de documento del título son las mismas antes y después. El scroll tampoco se mueve solo
		// una vez consumado el cambio, que es donde un ajuste de anclaje lo haría.
		expect(after.borderBottomWidth).toBe(before.borderBottomWidth);
		expect(after.headingTop).toBe(before.headingTop);
		await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
		expect(await page.evaluate(() => window.scrollY), 'el scroll se movió solo al cambiar el estado').toBe(
			after.scrollY,
		);
	});

	test(`home — la barra pinta su fondo en una ruta sin banda en el viewport ${viewport.name}`, async ({ page }) => {
		// eslint-disable-next-line playwright/no-skipped-test -- la ausencia de la ruta ya la reporta su guarda; repetirla acá sería el mismo fallo una vez por ancho
		test.skip(statuses.get(ROUTE_WITHOUT_BAND) !== 200, `"${ROUTE_WITHOUT_BAND}" no responde 200 en el dataset`);

		await openRoute(page, ROUTE_WITHOUT_BAND, viewport.width);
		const nav = await navPaintReport(page);

		expect(nav.bannerHeight).toBeGreaterThan(0);
		expect(nav.backgroundColor).toBe(OPAQUE_BACKGROUND);
		expect(nav.borderBottomColor).toBe(OPAQUE_BORDER);
	});
}
