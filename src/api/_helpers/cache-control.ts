import { environment } from './environment';

// `Cache-Control` se expresa en segundos. El repo no tiene un helper `parseDuration*`
// (ver typescript.md), así que —como en sitemap.controller— el valor va en segundos con
// la duración humana en comentario.

// SWR fijo (7 días): cubre la ventana entre que el purge-on-publish marca la entrada como
// stale y el CDN completa la revalidación en background. Sirve una respuesta stale-pero-usable
// al primer visitante post-purge en vez de bloquearlo contra el origen; más de unos días no
// aporta (tras el purge la revalidación es cuestión de segundos).
const READ_CACHE_STALE_WHILE_REVALIDATE = 604800; // 7 días

/**
 * Cadena `Cache-Control` para las respuestas cacheables de `/read` (página SSR y endpoint
 * de API). El `s-maxage` sale del interruptor de entorno (`environment.readCacheSMaxAge`):
 * producción arranca conservador y sube a un año recién con el purge-on-publish operativo
 * (ver #1856 / LITERARY_WORK_DESIGN.md §8). Fuente única para middleware y controller.
 */
export function readCacheControl(): string {
	return `public, s-maxage=${environment.readCacheSMaxAge}, stale-while-revalidate=${READ_CACHE_STALE_WHILE_REVALIDATE}`;
}
