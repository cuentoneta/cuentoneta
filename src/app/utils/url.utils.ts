/**
 * Recorta las barras finales de una URL base para poder concatenar paths sin generar dobles slashes.
 *
 * `environment.website` llega con barra final en producción (`https://host/`) y como `/` en dev;
 * normalizarla evita URLs como `https://host//assets/...` en canonical, datos estructurados, etc.
 */
export function normalizeBaseUrl(url: string): string {
	return url.replace(/\/+$/, '');
}
