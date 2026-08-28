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
const ROUTE = `/read/${STABLE_SLUGS.literaryWork}`;

const NAV_SELECTOR = 'cuentoneta-header';
// La franja que colapsa, que es la que se mide: lo inerte es el componente entero, un nivel más arriba.
const HEADER_SELECTOR = `${NAV_SELECTOR} header`;
const BRAND_LINK = `${NAV_SELECTOR} a[aria-label="La Cuentoneta — Inicio"]`;

// El servicio deriva la dirección de a pares de eventos de scroll por encima de este umbral, así que el
// estado oculto no se alcanza con un salto único: se scrollea de a tramos hasta que la barra se retrae.
const SCROLL_THRESHOLD = 400;
const SCROLL_STEP = 300;

// La barra encabeza el documento y aporta seis paradas —marca, cuatro entradas y el botón del menú—, así
// que un recorrido de este largo entra en ella de sobra si sigue siendo tabulable.
const TAB_STEPS = 8;

let status = 0;

test.beforeAll(async ({ request }) => {
	status = (await request.get(ROUTE)).status();
});

// Guarda como caso propio, no como `skip` silencioso: un dataset sin el fixture es un problema de la
// infraestructura de test, no un motivo para que el gate quede verde sin haber mirado nada.
test('la ruta existe en el dataset', () => {
	expect(status, `"${ROUTE}" no responde 200: los casos de la barra oculta no verifican nada`).toBe(200);
});

/** Abre la ruta en el único ancho donde la barra llega a ocultarse. */
async function openRoute(page: Page): Promise<void> {
	await page.setViewportSize({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });
	await page.goto(ROUTE);
	await expect(page.locator('h1').first()).toBeVisible();
}

/** Scrollea la ruta ya abierta hasta el estado oculto, con la transición de colapso ya terminada. */
async function hideNavBar(page: Page): Promise<void> {
	// Sin esto, una página que no da para scrollear lo suficiente dejaría el caso esperando a un estado
	// inalcanzable, y el fallo hablaría de un timeout en vez de del fixture. El mínimo no es el umbral de
	// 400px: el servicio descarta lo que no lo supera y recién después compara de a pares, así que hacen
	// falta dos posiciones por encima, y la segunda dista un tramo de scroll de la primera.
	const reachableScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
	expect(
		reachableScroll,
		`"${ROUTE}" no da para scrollear lo que hace falta para que la barra se retraiga`,
	).toBeGreaterThan(SCROLL_THRESHOLD + SCROLL_STEP);

	// Se scrollea desde adentro del sondeo, en tramos siempre hacia abajo, en vez de esperar un tiempo fijo
	// entre dos saltos: el servicio descarta los eventos que llegan demasiado seguidos, y cuántos hacen
	// falta depende de la máquina.
	//
	// La condición es el alto ya colapsado, que es a la vez la señal de que la barra se retrajo y de que su
	// transición terminó. Dos motivos para no mirar en cambio el atributo que la saca de la interacción:
	// con el defecto presente los casos fallarían por un timeout en vez de por lo que afirman, y a mitad de
	// la transición todavía hay franja que disputar, así que probarían otra cosa.
	await expect
		.poll(
			async () => {
				const height = (await page.locator(HEADER_SELECTOR).boundingBox())?.height;
				if (height !== 0) {
					await page.evaluate((step) => window.scrollBy(0, step), SCROLL_STEP);
				}
				return height;
			},
			{ message: 'la barra no llegó a colapsar: los casos no probarían el estado oculto' },
		)
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

	await openRoute(page);
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

	// Control positivo del propio instrumento: sin él, un listener que nunca corrió dejaría `clickTarget`
	// sin definir y la aserción de abajo pasaría sin que ningún clic haya ocurrido.
	expect(clickTarget, 'el clic no le llegó a nadie: la aserción siguiente pasaría en vacío').toBeDefined();
	expect(clickTarget, 'el clic sobre la franja de la barra oculta llegó a su contenido').not.toBe('nav');
});

/** Si el foco está, en este instante, dentro de la barra de navegación. */
function focusIsInNavBar(page: Page) {
	return page.evaluate((nav) => Boolean(document.activeElement?.closest(nav)), NAV_SELECTOR);
}

// Es el título literal del issue, y es lo que ninguna otra suite alcanza: el unitario afirma la política
// de foco de happy-dom al llamar `focus()`, no el recorrido de tabulación que hace el navegador.
test('la barra oculta no recibe el foco al tabular', async ({ page }) => {
	// eslint-disable-next-line playwright/no-skipped-test -- la ausencia del fixture ya la reporta la guarda de arriba; repetirla acá sería el mismo fallo dos veces
	test.skip(status !== 200, `"${ROUTE}" no responde 200 en el dataset`);

	await openRoute(page);
	await hideNavBar(page);
	await page.evaluate(() => document.body.focus());

	// Varias pulsaciones y no una: la barra encabeza el documento, así que con el defecto presente el
	// recorrido entra en ella enseguida, y con el arreglo debe pasar de largo hacia el contenido.
	for (let step = 0; step < TAB_STEPS; step++) {
		await page.keyboard.press('Tab');
		expect(await focusIsInNavBar(page), 'al tabular, el foco entró en una barra declarada ausente').toBe(false);
	}

	// Control positivo: si el recorrido nunca llegó a ningún lado, lo de arriba se cumpliría en vacío.
	const focusedTag = await page.evaluate(() => document.activeElement?.tagName.toLowerCase());
	expect(focusedTag, 'la tabulación no movió el foco a ningún lado').not.toBe('body');
});

// El foco que ya estaba adentro cuando la barra se oculta lo suelta el navegador, y solo él: happy-dom
// consulta los ancestros inertes al enfocar, pero no reevalúa un foco ya puesto.
test('la barra suelta el foco que ya tenía al ocultarse', async ({ page }) => {
	// eslint-disable-next-line playwright/no-skipped-test -- la ausencia del fixture ya la reporta la guarda de arriba; repetirla acá sería el mismo fallo dos veces
	test.skip(status !== 200, `"${ROUTE}" no responde 200 en el dataset`);

	await openRoute(page);
	await page.locator(BRAND_LINK).focus();

	// Control positivo: el escenario empieza con el foco adentro, que es lo que después se comprueba que
	// no sobrevive al ocultamiento.
	expect(await focusIsInNavBar(page), 'el foco no llegó a entrar en la barra: el caso no probaría nada').toBe(true);

	await hideNavBar(page);

	expect(await focusIsInNavBar(page), 'el foco quedó atrapado en una barra que la interfaz declara ausente').toBe(
		false,
	);
});
