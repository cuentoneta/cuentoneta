/**
 * La barra de navegación oculta no recibe foco ni clics.
 *
 * El estado oculto colapsa el alto y pinta transparente, y ninguna de las dos cosas quita nada del árbol:
 * sin un mecanismo que lo excluya, el contenido se derrama fuera de la caja de alto cero y sigue siendo
 * enfocable y clickeable. Las dos consecuencias que se afirman acá —el hit-test y la política de foco—
 * solo existen en un navegador real; el spec unitario alcanza únicamente el atributo que las declara.
 */
import { test, expect, type Page } from '@playwright/test';

import { STACKING_VIEWPORTS, VIEWPORT_HEIGHT } from './_utils/stacking';
import { STABLE_SLUGS } from './_utils/seo-fixtures';

// El único ancho donde la barra llega a ocultarse: `WindowLayoutService` la mantiene visible en cuanto el
// viewport supera `xs`.
const VIEWPORT_WIDTH = STACKING_VIEWPORTS[0].width;

// Una obra y no la home, para que un clic que active el enlace de marca sea distinguible del estado previo.
const ROUTE = `/story/${STABLE_SLUGS.story}`;

const NAV_SELECTOR = 'cuentoneta-header';
const HEADER_SELECTOR = `${NAV_SELECTOR} header`;
const BRAND_LINK = `${NAV_SELECTOR} a[aria-label="La Cuentoneta — Inicio"]`;

// El servicio deriva la dirección de a pares de eventos de scroll por encima de 400px, así que el estado
// oculto no se alcanza con un salto único: se scrollea de a tramos hasta que la barra se retrae.
const SCROLL_STEP = 300;

// La clase con que el componente expresa el estado oculto: es la señal de que la barra ya se retrajo,
// disponible tanto con el defecto presente como con él corregido.
const HIDDEN_CLASS = 'h-0';

let status = 0;

test.beforeAll(async ({ request }) => {
	status = (await request.get(ROUTE)).status();
});

// Guarda como caso propio, no como `skip` silencioso: un dataset sin el fixture es un problema de la
// infraestructura de test, no un motivo para que el gate quede verde sin haber mirado nada.
test('la ruta existe en el dataset', () => {
	expect(status, `"${ROUTE}" no responde 200: los casos de la barra oculta no verifican nada`).toBe(200);
});

/** Deja la página en el estado oculto, con la transición de colapso ya terminada. */
async function hideNavBar(page: Page): Promise<void> {
	await page.setViewportSize({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });
	await page.goto(ROUTE);
	await expect(page.locator('h1').first()).toBeVisible();

	// Sin esto, una página que no da para scrollear más allá del umbral dejaría el caso esperando a un
	// estado inalcanzable, y el fallo hablaría de un timeout en vez de del fixture.
	const reachableScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
	expect(reachableScroll, `"${ROUTE}" no da para scrollear más allá del umbral que retrae la barra`).toBeGreaterThan(
		400,
	);

	// Se scrollea desde adentro del sondeo, en tramos siempre hacia abajo, en vez de esperar un tiempo fijo
	// entre dos saltos: el servicio descarta los eventos que llegan demasiado seguidos, y cuántos hacen
	// falta depende de la máquina.
	//
	// La condición es la clase del estado oculto y no el mecanismo que lo saca de la interacción: así, con
	// el defecto presente, los casos fallan por lo que afirman —el clic y el foco— y no por un timeout
	// esperando el atributo que justamente falta.
	await page.waitForFunction(
		({ header, hiddenClass, step }) => {
			if (document.querySelector(header)?.classList.contains(hiddenClass)) {
				return true;
			}
			window.scrollBy(0, step);
			return false;
		},
		{ header: HEADER_SELECTOR, hiddenClass: HIDDEN_CLASS, step: SCROLL_STEP },
		{ polling: 100 },
	);

	// La clase cambia al empezar a ocultarse, pero el alto tarda lo que dura la transición. Se espera al
	// final del colapso, y no un tiempo fijo, para que los casos midan el estado que dicen medir: con la
	// barra a medio camino todavía hay franja que disputar y probarían otra cosa.
	await expect
		.poll(async () => (await page.locator(HEADER_SELECTOR).boundingBox())?.height, {
			message: 'la barra no llegó a colapsar: los casos no probarían el estado oculto',
		})
		.toBe(0);
}

/** La caja del enlace de marca, que con la barra oculta sigue derramada sobre la franja superior. */
async function brandLinkBox(page: Page) {
	const box = await page.locator(BRAND_LINK).boundingBox();
	if (!box) {
		throw new Error('El enlace de marca no ocupa lugar: no habría dónde hacer clic');
	}
	return box;
}

test('la barra oculta no responde a los clics sobre su franja', async ({ page }) => {
	// eslint-disable-next-line playwright/no-skipped-test -- la ausencia del fixture ya la reporta la guarda de arriba; repetirla acá sería el mismo fallo dos veces
	test.skip(status !== 200, `"${ROUTE}" no responde 200 en el dataset`);

	await hideNavBar(page);
	const box = await brandLinkBox(page);

	// Control positivo: sin él, el caso pasaría igual con un enlace ya recortado, que es otra forma de
	// arreglarlo y no la que este spec afirma. Que la barra haya colapsado lo verifica `hideNavBar`.
	expect(box.width * box.height, 'el enlace de marca no ocupa área: el clic no caería sobre él').toBeGreaterThan(0);

	// Se mide a quién le llega el evento y no si el enlace navegó: la navegación depende además del router
	// y de la ruta destino, así que un caso montado sobre ella podría pasar por motivos ajenos al hit-test.
	await page.evaluate((nav) => {
		const scope = window as unknown as { clickTarget?: string };
		document.addEventListener(
			'click',
			(event) => {
				const target = event.target as Element | null;
				scope.clickTarget = target?.closest(nav) ? 'nav' : (target?.tagName.toLowerCase() ?? 'ninguno');
			},
			{ capture: true, once: true },
		);
	}, NAV_SELECTOR);

	await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);

	const clickTarget = await page.evaluate(() => (window as unknown as { clickTarget?: string }).clickTarget);
	expect(clickTarget, 'el clic sobre la franja de la barra oculta llegó a su contenido').not.toBe('nav');
});

test('la barra oculta no toma el foco', async ({ page }) => {
	// eslint-disable-next-line playwright/no-skipped-test -- la ausencia del fixture ya la reporta la guarda de arriba; repetirla acá sería el mismo fallo dos veces
	test.skip(status !== 200, `"${ROUTE}" no responde 200 en el dataset`);

	await hideNavBar(page);

	const focusLandedInNavBar = await page.evaluate(
		({ nav, brand }) => {
			const link = document.querySelector<HTMLElement>(brand);
			if (!link) {
				throw new Error('No se encontró el enlace de marca');
			}
			link.focus();
			return Boolean(document.activeElement?.closest(nav));
		},
		{ nav: NAV_SELECTOR, brand: BRAND_LINK },
	);

	expect(focusLandedInNavBar, 'el foco entró en una barra que la interfaz declara ausente').toBe(false);
});
