/**
 * Test de regresión del solapamiento entre el hero de la obra y la barra de navegación fija.
 *
 * Es una aserción de apilamiento: no mira clases ni z-index declarados —eso mediría implementación y
 * pasaría igual con el defecto presente— sino quién responde a un click sobre la franja del nav una vez
 * que la página scrolleó. Si el hero se dibuja encima, es él quien responde.
 */
import { test, expect } from '@playwright/test';

import { STABLE_SLUGS } from './_utils/seo-fixtures';

const readPath = `/read/${STABLE_SLUGS.literaryWork}`;

// El defecto se manifestó en los tres anchos del Design System, con distinto elemento del hero pisando
// la barra en cada uno: se cubren los tres y no solo el más angosto.
const VIEWPORTS = [
	{ name: 'desktop', width: 1440, height: 900 },
	{ name: 'tablet', width: 768, height: 1024 },
	{ name: 'mobile', width: 390, height: 844 },
];

for (const viewport of VIEWPORTS) {
	test(`read — el hero no se dibuja sobre la barra de navegación en ${viewport.name}`, async ({ page, request }) => {
		const response = await request.get(readPath);
		// eslint-disable-next-line playwright/no-skipped-test -- skip condicional por contenido del dataset, no un test deshabilitado
		test.skip(
			response.status() === 404,
			`No existe literaryWork con slug "${STABLE_SLUGS.literaryWork}" en el dataset`,
		);

		await page.setViewportSize({ width: viewport.width, height: viewport.height });
		await page.goto(readPath);
		await expect(page.locator('cuentoneta-literary-work-hero-header')).toBeVisible();

		await page.evaluate(() => window.scrollTo(0, 100));

		// Se muestrea a lo ancho de la barra —logo, centro y zona de enlaces— porque cada viewport la
		// solapa con una parte distinta del hero.
		const intruders = await page.evaluate(() => {
			const nav = document.querySelector('cuentoneta-header');
			if (!nav) {
				throw new Error('No se encontró la barra de navegación');
			}
			const { top, bottom, width } = nav.getBoundingClientRect();
			const y = (top + bottom) / 2;
			return [0.1, 0.3, 0.5, 0.7, 0.9]
				.map((ratio) => {
					const x = width * ratio;
					const element = document.elementFromPoint(x, y);
					return element?.closest('cuentoneta-literary-work-hero-header') ? Math.round(x) : undefined;
				})
				.filter((x) => x !== undefined);
		});

		expect(intruders).toEqual([]);
	});
}
