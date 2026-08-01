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
 * Aplica a una respuesta cacheable de `/read` los headers de caché de borde: `s-maxage` corto
 * (interruptor `environment.readCacheSMaxAge`) con `stale-while-revalidate` largo, efectivos solo
 * en el CDN de Vercel, más un `Cache-Control` que mantiene fresco al browser.
 *
 * La frescura la da el vencimiento del `s-maxage`, no una invalidación explícita: no hay purga
 * dirigida, y por eso tampoco endpoint, secreto compartido ni etiquetado por obra.
 * Ver LITERARY_WORK_DESIGN.md §8.
 *
 * Fuera de producción no emite nada (coherente con `noindexNonProduction`): un preview compartiría
 * el CDN y serviría contenido de un dataset que no es el público. La condición vive acá y no en cada
 * llamador para que la política de cacheabilidad tenga un solo dueño.
 */
export function applyReadCacheHeaders(c: Context): void {
	if (!environment.production) {
		return;
	}

	c.header(
		'Vercel-CDN-Cache-Control',
		`public, s-maxage=${environment.readCacheSMaxAge}, stale-while-revalidate=${READ_CACHE_STALE_WHILE_REVALIDATE}`,
	);
	c.header('Cache-Control', BROWSER_CACHE_CONTROL);
}
