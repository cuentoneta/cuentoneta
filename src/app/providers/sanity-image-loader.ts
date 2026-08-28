import { IMAGE_LOADER, type ImageLoaderConfig } from '@angular/common';
import { makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';

import { withSanityImageParams } from '@utils/sanity-image.utils';

/**
 * Deriva de cada `ngSrc` la URL que el navegador realmente pide al CDN de Sanity.
 *
 * El ACL emite la URL canónica del asset, sin parámetros: el ancho al que una imagen se pinta es un
 * dato de la pantalla, y el backend no lo conoce —la misma portada alimenta una tarjeta chica y el
 * fondo del hero—. Sin un loader, `NgOptimizedImage` no reescribe nada y se descarga el original,
 * que en este dataset llega a pesar megabytes para una caja de un par de cientos de píxeles.
 */

const SANITY_CDN_HOSTNAME = 'cdn.sanity.io';

/**
 * Calidad de recompresión que pide la app. Fijarla acá, y no dejar la del CDN, es lo que vuelve
 * predecible el peso de una imagen frente a un original subido sin optimizar.
 */
const IMAGE_QUALITY = 75;

/**
 * Verdadero solo si `src` es una URL absoluta cuyo host es exactamente el del CDN.
 *
 * El loader intercepta *todo* `ngSrc` de la aplicación, incluidos los assets locales y algún host
 * externo, así que el guard es lo que impide corromperlos. Compara el hostname parseado y no el
 * texto: `https://cdn.sanity.io.evil.com/x.png` contiene el string sin ser el CDN.
 */
export function isSanityImageUrl(src: string): boolean {
	try {
		return new URL(src).hostname === SANITY_CDN_HOSTNAME;
	} catch {
		return false;
	}
}

/**
 * Devuelve el `src` intacto cuando no es del CDN de Sanity. Un `config.width` ausente —el caso de
 * las imágenes con `fill` que no declaran `sizes`— deja la URL sin ancho: el CDN sirve entonces el
 * original, negociado en formato y calidad.
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
