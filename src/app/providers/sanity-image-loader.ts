import { IMAGE_LOADER, type ImageLoaderConfig } from '@angular/common';
import { makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';

import { isSanityImageUrl, withSanityImageParams } from '@utils/sanity-image.utils';

/**
 * Único punto donde se le agregan parámetros de transformación a una imagen de Sanity.
 *
 * El ACL emite la URL canónica del asset: el ancho al que se pinta es un dato de la pantalla, y el
 * backend no lo conoce —la misma portada alimenta una tarjeta chica y el fondo de un hero—. Envolver
 * la URL además en el componente duplica el parámetro, y el CDN se queda con el primero.
 */

// La calidad la fija la app y no el CDN, para que el peso no dependa de cuán optimizado se haya
// subido cada original.
const IMAGE_QUALITY = 75;

/** Lo que un `<img>` puede pedirle al loader por `[loaderParams]`. */
export type SanityImageLoaderParams = {
	/**
	 * Ancho a pedir, en píxeles, en lugar del que `NgOptimizedImage` deriva del `<img>`. Para una
	 * imagen cuyo tamaño de descarga no se sigue del espacio que ocupa: un fondo difuminado, que se
	 * estira a la pantalla entera pero no gana nada con resolución.
	 */
	readonly width?: number;
};

/**
 * Devuelve el `src` intacto cuando no es del CDN de Sanity: el loader intercepta *todo* `ngSrc` de
 * la aplicación, incluidos los assets propios y algún host externo, y el guard es lo que impide
 * corromperlos.
 *
 * Sin ancho —el `src` de fallback, que `NgOptimizedImage` pide aparte de las entradas del `srcset`—
 * el CDN sirve el original, negociado en formato y calidad.
 */
export function sanityImageLoader(config: ImageLoaderConfig): string {
	if (!isSanityImageUrl(config.src)) {
		return config.src;
	}

	const requested: SanityImageLoaderParams | undefined = config.loaderParams;
	return withSanityImageParams(config.src, {
		w: requested?.width ?? config.width,
		auto: 'format',
		q: IMAGE_QUALITY,
	});
}

export function provideSanityImageLoader(): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: IMAGE_LOADER, useValue: sanityImageLoader }]);
}
