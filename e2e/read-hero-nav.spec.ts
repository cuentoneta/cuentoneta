/**
 * Test de regresión del solapamiento entre el hero de la obra y la barra de navegación fija.
 *
 * Es una aserción de apilamiento: no mira clases ni z-index declarados —eso mediría implementación y
 * pasaría igual con el defecto presente— sino quién responde sobre la franja del nav una vez que la
 * página scrolleó. Si el hero se dibuja encima, es él quien responde.
 */
import { test, expect } from '@playwright/test';

import { STABLE_SLUGS } from './_utils/seo-fixtures';

const readPath = `/read/${STABLE_SLUGS.literaryWork}`;

// El defecto se manifestó en los tres anchos del Design System, con distinto elemento del hero pisando
// la barra en cada uno: se cubren los tres y no solo el más angosto.
const VIEWPORTS = Object.freeze([
	{ name: 'desktop', width: 1440, height: 900 },
	{ name: 'tablet', width: 768, height: 1024 },
	{ name: 'mobile', width: 390, height: 844 },
] as const);

let status: number;

test.beforeAll(async ({ request }) => {
	const response = await request.get(readPath);
	status = response.status();
});

// Deliberadamente sin guarda de contenido: un dataset sin la obra de prueba es un problema de la
// infraestructura de test, no un motivo para dejar de verificar. Sin este caso, los de abajo se
// saltearían en silencio y el gate quedaría verde sin haber mirado nada — que es exactamente lo que
// venía pasando con el slug anterior.
test('read — el slug estable de la obra existe en el dataset', () => {
	expect(status, `"/read/${STABLE_SLUGS.literaryWork}" no responde 200: los casos de /read no verifican nada`).toBe(
		200,
	);
});

for (const viewport of VIEWPORTS) {
	test(`read — el hero no se dibuja sobre la barra de navegación en ${viewport.name}`, async ({ page }) => {
		// eslint-disable-next-line playwright/no-skipped-test -- la ausencia de la obra ya la reporta el caso de arriba; repetirla acá sería el mismo fallo cuatro veces
		test.skip(status !== 200, `No existe literaryWork con slug "${STABLE_SLUGS.literaryWork}" en el dataset`);

		await page.setViewportSize({ width: viewport.width, height: viewport.height });
		await page.goto(readPath);
		await expect(page.locator('cuentoneta-literary-work-hero-header')).toBeVisible();

		// 100 px alcanza para que el hero se desplace bajo la barra y se queda corto del umbral con el que
		// LayoutService la oculta: con la barra retraída no habría franja que disputar y el caso pasaría
		// sin haber ejercido nada.
		await page.evaluate(() => window.scrollTo(0, 100));

		// Medido: Firefox responde el elemento raíz si el hit-test corre antes de componer el scroll, y el
		// caso fallaría por esa carrera y no por el apilamiento. Se espera a que el punto resuelva a algún
		// elemento del contenido — sea el nav o el hero, que es justamente lo que el caso discrimina.
		await page.waitForFunction(() => {
			const nav = document.querySelector('cuentoneta-header');
			if (!nav) {
				return false;
			}
			const { top, bottom, width } = nav.getBoundingClientRect();
			const element = document.elementFromPoint(width / 2, (top + bottom) / 2);
			return element !== null && element !== document.documentElement && element !== document.body;
		});

		// Se muestrea a lo ancho de la barra —logo, centro y zona de enlaces— porque cada viewport la
		// solapa con una parte distinta del hero.
		const hits = await page.evaluate(() => {
			const nav = document.querySelector('cuentoneta-header');
			if (!nav) {
				throw new Error('No se encontró la barra de navegación');
			}
			const { top, bottom, width } = nav.getBoundingClientRect();
			const y = (top + bottom) / 2;
			return {
				scrollY: window.scrollY,
				navHeight: bottom - top,
				owners: [0.1, 0.3, 0.5, 0.7, 0.9].map((ratio) => {
					const element = document.elementFromPoint(width * ratio, y);
					if (element?.closest('cuentoneta-literary-work-hero-header')) {
						return 'hero';
					}
					return element?.closest('cuentoneta-header') ? 'nav' : 'otro';
				}),
			};
		});

		// Control positivo: sin esto, "nadie del hero intercepta" se cumpliría igual con la página sin
		// scrollear o con la barra retraída a alto cero, y el caso pasaría en vacío.
		expect(hits.scrollY).toBeGreaterThan(0);
		expect(hits.navHeight).toBeGreaterThan(0);
		expect(hits.owners).toEqual(['nav', 'nav', 'nav', 'nav', 'nav']);
	});
}
