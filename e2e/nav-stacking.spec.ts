/**
 * La barra de navegación fija responde sobre su propia franja en toda ruta con contenido, en los tres
 * anchos del Design System.
 *
 * Generaliza el caso de la página de lectura, que nació de un defecto puntual: dos componentes que no se conocían
 * eligieron el mismo valor de apilamiento, quedaron en el mismo contexto y el empate lo resolvió el orden
 * del documento. La escala y sus reglas de lint impiden ahora elegir un valor fuera de rango, pero no
 * pueden juzgar si el aislamiento quedó en el ancestro correcto: eso solo se mide en un navegador.
 */
import { test, expect } from '@playwright/test';

import { NAV_OWNS_EVERY_SAMPLE, STACKING_VIEWPORTS, VIEWPORT_HEIGHT, navStackingReport } from './_utils/stacking';
import { STABLE_SLUGS } from './_utils/seo-fixtures';

// Las rutas con fixture estable, cada una con un elemento que **la propia página** aporta. El selector no
// puede ser del shell —`cuentoneta-header` está presente aun con la ruta en esqueleto o en error—, porque
// entonces el hit-test correría antes de que haya contenido con el que disputar la franja.
//
// La página de lectura no está acá: tiene su propio spec de regresión, que es el del defecto que originó todo esto y
// nombra al hero como sospechoso. Sumarla también acá duplicaría su costo en el gate más frágil del repo.
const ROUTES = Object.freeze([
	{ name: 'home', path: '/home', ready: 'h1' },
	{ name: 'author', path: `/author/${STABLE_SLUGS.author}`, ready: 'h1' },
	// El esqueleto de la colección no declara `h1`, así que esperarlo discrimina la página servida de su
	// estado de carga. El estado de error sí declara uno, y a ese lo descarta la guarda de status: la
	// colección inexistente responde 404, no 200.
	{ name: 'collection', path: `/collection/${STABLE_SLUGS.collection}`, ready: 'h1' },
] as const);

const statuses = new Map<string, number>();

test.beforeAll(async ({ request }) => {
	for (const route of ROUTES) {
		const response = await request.get(route.path);
		statuses.set(route.name, response.status());
	}
});

// Una guarda por ruta, y ninguna salteable: un dataset sin el fixture de una ruta es un problema de la
// infraestructura de test, no un motivo para dejar de verificar. Sin estos casos, los de abajo se
// saltearían en silencio y el gate quedaría verde sin haber mirado nada.
for (const route of ROUTES) {
	test(`${route.name} — la ruta existe en el dataset`, () => {
		expect(
			statuses.get(route.name),
			`"${route.path}" no responde 200: sus casos de apilamiento no verifican nada`,
		).toBe(200);
	});
}

for (const route of ROUTES) {
	for (const viewport of STACKING_VIEWPORTS) {
		test(`${route.name} — nada se dibuja sobre la barra de navegación en el viewport ${viewport.name}`, async ({
			page,
		}) => {
			// eslint-disable-next-line playwright/no-skipped-test -- la ausencia del fixture ya la reporta la guarda de la ruta; repetirla acá sería el mismo fallo una vez por ancho
			test.skip(statuses.get(route.name) !== 200, `"${route.path}" no responde 200 en el dataset`);

			await page.setViewportSize({ width: viewport.width, height: VIEWPORT_HEIGHT });
			await page.goto(route.path);
			await expect(page.locator(route.ready).first()).toBeVisible();

			const report = await navStackingReport(page);

			// Controles positivos: sin ellos, "nadie tapa la barra" se cumpliría igual con la página sin
			// scrollear o con la barra retraída a alto cero.
			expect(report.scrollY).toBeGreaterThan(0);
			expect(report.navHeight).toBeGreaterThan(0);
			expect(report.owners).toEqual(NAV_OWNS_EVERY_SAMPLE);
		});
	}
}
