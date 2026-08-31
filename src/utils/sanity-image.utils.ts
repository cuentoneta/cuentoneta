const SANITY_CDN_HOSTNAME = 'cdn.sanity.io';

/**
 * Verdadero solo si `url` es una URL absoluta servida por el CDN de Sanity.
 *
 * Compartido a propósito: el loader de la aplicación decide con esto qué transforma y la
 * intercepción de los e2e qué sustituye, y dos definiciones que divergieran dejarían a los tests
 * cubriendo un conjunto distinto del que la aplicación pide.
 *
 * Compara el hostname parseado y no el texto, porque `https://cdn.sanity.io.evil.com/x.png` lo
 * contiene sin ser el CDN.
 */
export function isSanityImageUrl(url: string): boolean {
	try {
		const { hostname, protocol } = new URL(url);
		return hostname === SANITY_CDN_HOSTNAME && protocol === 'https:';
	} catch {
		return false;
	}
}

// Parámetros de transformación del CDN de Sanity que la UI agrega sobre una URL ya resuelta.
export type SanityImageParams = {
	w?: number;
	h?: number;
	auto?: 'format';
	/** Calidad de recompresión, 0–100. Sin él, el CDN aplica la suya. */
	q?: number;
};

/**
 * Agrega parámetros de transformación a una URL de imagen de Sanity respetando la query string
 * existente. Las URLs con crop aplicado en el Studio ya vienen con `?rect=...`; concatenar un
 * segundo `?` corrompe el valor de `rect` y el CDN responde 400. El separador se elige según la
 * URL ya tenga o no query string.
 */
export function withSanityImageParams(url: string, params: SanityImageParams): string {
	if (!url) {
		return url;
	}
	const query = Object.entries(params)
		.filter(([, value]) => value !== undefined)
		.map(([key, value]) => `${key}=${value}`)
		.join('&');
	if (!query) {
		return url;
	}
	const separator = url.includes('?') ? '&' : '?';
	return `${url}${separator}${query}`;
}
