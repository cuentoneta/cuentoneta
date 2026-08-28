/**
 * Afirma que la suite de e2e no descarga assets del CDN de Sanity.
 *
 * El resto de los specs no notaría la pérdida: si el fixture de `_utils/test.ts` dejara de instalar
 * su ruta, todos seguirían pasando en verde y la única señal sería la factura del CDN. Este es el
 * caso que la convierte en un fallo de gate.
 */
import { expect, type Page, type Response } from '@playwright/test';

import { test } from './_utils/test';
import { isSanityAssetUrl, placeholderFor } from './_utils/sanity-assets';
import { STABLE_SLUGS } from './_utils/seo-fixtures';
import { DESKTOP_VIEWPORT } from './_utils/viewports';

type ServedAsset = { url: string; body: string };

/**
 * Recorre la página entera y devuelve el cuerpo con el que se sirvió cada asset del CDN.
 *
 * El scroll no es decorativo: las portadas fuera de la primera pantalla van con `loading="lazy"`, y
 * sin recorrerla el caso afirmaría sobre las pocas que el navegador pide de entrada.
 */
async function collectCdnAssets(page: Page, route: string): Promise<ServedAsset[]> {
	const served: Promise<ServedAsset>[] = [];
	const collect = (response: Response) => {
		const url = response.url();
		if (isSanityAssetUrl(url)) {
			served.push(response.body().then((body) => ({ url, body: body.toString() })));
		}
	};
	page.on('response', collect);

	await page.setViewportSize(DESKTOP_VIEWPORT);
	await page.goto(route);
	await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
	await page.waitForLoadState('load');

	// El listener se desengancha antes de resolver los cuerpos: una imagen diferida que llegue durante
	// las aserciones dejaría un `body()` pendiente que al terminar el caso rechaza, y el spec fallaría
	// por su propia instrumentación en vez de por lo que mide.
	page.off('response', collect);
	return Promise.all(served);
}

const ROUTES = [
	{ name: 'la página de inicio', path: '/home' },
	{ name: 'la página de una obra', path: `/literary-work/${STABLE_SLUGS.literaryWork}` },
];

for (const { name, path } of ROUTES) {
	test(`sanity-assets — ${name} sirve sus imágenes sin salir al CDN`, async ({ page, interceptedSanityAssets }) => {
		const served = await collectCdnAssets(page, path);

		// Control positivo: el día que la página deje de referenciar imágenes de Sanity, este caso avisa
		// en vez de quedar verde sin proteger nada.
		expect(
			interceptedSanityAssets.length,
			`"${path}" no pidió ninguna imagen del CDN: el caso no verifica la intercepción`,
		).toBeGreaterThan(0);

		// Ningún cuerpo trajo bytes del CDN: todos son el sustituto que el fixture genera para esa URL.
		expect(served).toEqual(served.map(({ url }) => ({ url, body: placeholderFor(url) })));
	});
}
