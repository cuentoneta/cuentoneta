// Parámetros de transformación del CDN de Sanity que la UI agrega sobre una URL ya resuelta.
export type SanityImageParams = {
	w?: number;
	h?: number;
	auto?: 'format';
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
