/**
 * El `test` que usan todos los specs de e2e, en lugar del de `@playwright/test`: sustituye los
 * assets del CDN de Sanity por un pixel local en vez de descargarlos.
 *
 * La sustitución se cuelga del fixture `context` y no de uno automático a propósito: así los specs
 * que solo usan `request` —la mayoría de los de indexado, que afirman sobre el HTML servido— no
 * pagan el arranque de un navegador que no necesitan.
 *
 * El sustituto conserva las dimensiones del original, así que la geometría de la página no cambia
 * —ver `placeholderFor`—.
 *
 * `expect` no se reexporta acá: no lo toca ningún fixture, así que sigue saliendo del paquete.
 *
 * El opt-out (`test.use({ interceptSanityAssets: false })`) existe para los specs que miden
 * geometría y no contenido: sustituir una imagen cambia *cuándo* llega, y eso corre las carreras
 * que esos specs ya bordean. Medido: con la intercepción puesta, el apilamiento contra la barra de
 * navegación empezó a fallar de a ratos con el hit-test resolviendo a la raíz. Quien lo use paga el
 * ancho de banda del CDN a cambio del timing real, así que la vara para tomarlo es alta.
 */
import { test as base } from '@playwright/test';

import { isSanityAssetUrl, PLACEHOLDER_CONTENT_TYPE, placeholderFor } from './sanity-assets';

type SanityAssetOptions = {
	/** Se declara por spec con `test.use()`. Ver el opt-out en el encabezado del archivo. */
	interceptSanityAssets: boolean;
};

type SanityAssetFixtures = {
	/**
	 * URLs de los assets del CDN que se interceptaron en el test, en orden de pedido. Vacío tanto
	 * cuando la página no referencia ninguno como cuando el spec nunca abrió una página: quien lo
	 * use para afirmar cobertura tiene que exigirlo no vacío.
	 */
	interceptedSanityAssets: string[];
};

export const test = base.extend<SanityAssetOptions & SanityAssetFixtures>({
	interceptSanityAssets: [true, { option: true }],

	// Playwright deriva las dependencias de un fixture del destructuring de su primer parámetro y
	// rechaza la firma sin él; este no depende de ninguna.
	// eslint-disable-next-line no-empty-pattern
	interceptedSanityAssets: async ({}, use) => {
		await use([]);
	},

	context: async ({ context, interceptSanityAssets, interceptedSanityAssets }, use) => {
		if (interceptSanityAssets) {
			await context.route(
				(url) => isSanityAssetUrl(url.toString()),
				async (route) => {
					const url = route.request().url();
					interceptedSanityAssets.push(url);
					await route.fulfill({ contentType: PLACEHOLDER_CONTENT_TYPE, body: placeholderFor(url) });
				},
			);
		}
		await use(context);
	},
});
