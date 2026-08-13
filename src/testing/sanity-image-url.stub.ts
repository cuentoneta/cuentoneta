import { localImagePathForImageSource } from '@mocks/onoff-image-assets.mock';

/**
 * El builder de imágenes de Sanity, resolviendo cada referencia al asset local que el corpus le asocia en
 * vez de a una URL de `cdn.sanity.io` atada al dataset del entorno. Es lo que permite que los cruces del
 * corpus de dominio contra el ACL comparen las imágenes en vez de excluirlas.
 *
 * Encadena `auto()` porque parte de los mapeos resuelven con formato automático: sin él, ese camino
 * rompería con un `TypeError` opaco en lugar de con una diferencia de comparación.
 *
 * Se consume desde la factory de `vi.mock('@sanity/image-url', …)`, que se hoistea: hay que importarlo
 * **dentro** del callback asíncrono, no en el scope del módulo.
 */
export function stubImageUrlBuilderModule() {
	return {
		createImageUrlBuilder: () => ({
			image: (source: unknown) => {
				const built = { url: () => localImagePathForImageSource(source), auto: () => built };
				return built;
			},
		}),
	};
}
