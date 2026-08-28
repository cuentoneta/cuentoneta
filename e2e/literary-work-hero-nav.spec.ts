/**
 * Test de regresión del solapamiento entre el hero de la obra y la barra de navegación fija.
 *
 * Es una aserción de apilamiento: no mira clases ni z-index declarados —eso mediría implementación y
 * pasaría igual con el defecto presente— sino quién responde sobre la franja del nav una vez que la
 * página scrolleó. Si el hero se dibuja encima, es él quien responde.
 *
 * El mecanismo vive en `_utils/stacking`, compartido con el caso general de todas las rutas. Acá queda el
 * caso que nombra al hero: es el que documenta el defecto concreto del que salió la escala.
 */
import { test, expect } from '@playwright/test';

import { NAV_OWNS_EVERY_SAMPLE, STACKING_VIEWPORTS, VIEWPORT_HEIGHT, navStackingReport } from './_utils/stacking';
import { STABLE_SLUGS } from './_utils/seo-fixtures';

const literaryWorkPath = `/literary-work/${STABLE_SLUGS.literaryWork}`;

let status: number;

test.beforeAll(async ({ request }) => {
	const response = await request.get(literaryWorkPath);
	status = response.status();
});

// Deliberadamente sin guarda de contenido: un dataset sin la obra de prueba es un problema de la
// infraestructura de test, no un motivo para dejar de verificar. Sin este caso, los de abajo se
// saltearían en silencio y el gate quedaría verde sin haber mirado nada — que es exactamente lo que
// venía pasando con el slug anterior.
test('literary-work — el slug estable de la obra existe en el dataset', () => {
	expect(status, `"${literaryWorkPath}" no responde 200: los casos de la obra no verifican nada`).toBe(200);
});

for (const viewport of STACKING_VIEWPORTS) {
	test(`literary-work — el hero no se dibuja sobre la barra de navegación en el viewport ${viewport.name}`, async ({
		page,
	}) => {
		// eslint-disable-next-line playwright/no-skipped-test -- la ausencia de la obra ya la reporta el caso de arriba; repetirla acá sería el mismo fallo cuatro veces
		test.skip(status !== 200, `No existe literaryWork con slug "${STABLE_SLUGS.literaryWork}" en el dataset`);

		await page.setViewportSize({ width: viewport.width, height: VIEWPORT_HEIGHT });
		await page.goto(literaryWorkPath);
		await expect(page.locator('cuentoneta-literary-work-hero-header')).toBeVisible();

		const report = await navStackingReport(page);

		// Control positivo: sin esto, "nadie del hero intercepta" se cumpliría igual con la página sin
		// scrollear o con la barra retraída a alto cero, y el caso pasaría en vacío.
		expect(report.scrollY).toBeGreaterThan(0);
		expect(report.navHeight).toBeGreaterThan(0);
		expect(report.owners).toEqual(NAV_OWNS_EVERY_SAMPLE);
	});
}
