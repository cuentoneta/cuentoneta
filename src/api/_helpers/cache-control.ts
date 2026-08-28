import type { Context } from 'hono';
import { environment } from './environment';

// `Cache-Control` se expresa en segundos. El repo no tiene un helper `parseDuration*`
// (ver typescript.md), así que —como en sitemap.controller— el valor va en segundos con
// la duración humana en comentario.

// El SWR largo es el mecanismo, no un complemento: vencido el `s-maxage`, el CDN sigue sirviendo
// la respuesta cacheada al instante y revalida contra el origen en background. El lector nunca
// espera al origen, y una edición se propaga en la visita siguiente al vencimiento.
const READ_CACHE_STALE_WHILE_REVALIDATE = 604800; // 7 días

// El browser no cachea la página: el TTL vive solo en `Vercel-CDN-Cache-Control`, que Vercel no
// reenvía. Así la revalidación ocurre en un único lugar; con un TTL propio en el browser, una
// edición ya revalidada por el CDN seguiría sin verse hasta que venciera el del navegador.
const BROWSER_CACHE_CONTROL = 'public, max-age=0, must-revalidate';

/**
 * Decide si la página de lectura es cacheable en el entorno actual. Fuera de producción no lo es (coherente con
 * `noindexNonProduction`): un preview comparte el CDN y serviría contenido de un dataset que no es
 * el público. Exportada para que el middleware corte antes de bufferizar el body, sin duplicar la
 * condición: la política sigue teniendo un solo dueño.
 */
export function isReadCacheEnabled(): boolean {
	return environment.production;
}

/**
 * Aplica a una respuesta cacheable de la página de lectura los headers de caché de borde: `s-maxage` corto
 * (interruptor `environment.readCacheSMaxAge`) con `stale-while-revalidate` largo, efectivos solo
 * en el CDN de Vercel, más un `Cache-Control` que mantiene fresco al browser.
 *
 * La frescura la da el vencimiento del `s-maxage`, no una invalidación explícita.
 * Ver LITERARY_WORK_DESIGN.md §8.
 */
export function applyReadCacheHeaders(c: Context): void {
	if (!isReadCacheEnabled()) {
		return;
	}

	c.header(
		'Vercel-CDN-Cache-Control',
		`public, s-maxage=${environment.readCacheSMaxAge}, stale-while-revalidate=${READ_CACHE_STALE_WHILE_REVALIDATE}`,
	);
	c.header('Cache-Control', BROWSER_CACHE_CONTROL);

	// El `x-request-id` de quien produjo el miss queda congelado en la copia cacheada y se devuelve
	// idéntico a todos los hits durante el TTL, lo que rompe la correlación de logs en vez de
	// ayudarla. Un id ausente es más honesto que uno que miente.
	c.header('x-request-id', undefined);
}
