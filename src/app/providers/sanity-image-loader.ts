import { IMAGE_LOADER, type ImageLoaderConfig } from '@angular/common';
import { makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';

import { isSanityImageUrl, withSanityImageParams } from '@utils/sanity-image.utils';

/**
 * Deriva de cada `ngSrc` la URL que el navegador realmente pide al CDN de Sanity.
 *
 * El ACL emite la URL canónica del asset, sin parámetros: el ancho al que una imagen se pinta es un
 * dato de la pantalla, y el backend no lo conoce —la misma portada alimenta una tarjeta chica y el
 * fondo del hero—. Sin un loader, `NgOptimizedImage` no reescribe nada y se descarga el original,
 * que en este dataset llega a pesar megabytes para una caja de un par de cientos de píxeles.
 */

/**
 * Calidad de recompresión que pide la app. Fijarla acá, y no dejar la del CDN, es lo que vuelve
 * predecible el peso de una imagen frente a un original subido sin optimizar.
 */
const IMAGE_QUALITY = 75;

/**
 * Devuelve el `src` intacto cuando no es del CDN de Sanity — el loader intercepta *todo* `ngSrc` de
 * la aplicación, incluidos los assets propios y algún host externo, así que el guard es lo que
 * impide corromperlos.
 *
 * `NgOptimizedImage` invoca al loader una vez por entrada del `srcset` —con el ancho de cada una— y
 * otra sin ancho para el `src` de fallback, que queda sin `w` a propósito: es el que usa un
 * navegador que no entiende `srcset`.
 */
export function sanityImageLoader(config: ImageLoaderConfig): string {
	if (!isSanityImageUrl(config.src)) {
		return config.src;
	}
	return withSanityImageParams(config.src, { w: config.width, auto: 'format', q: IMAGE_QUALITY });
}

export function provideSanityImageLoader(): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: IMAGE_LOADER, useValue: sanityImageLoader }]);
}
