import type { Context } from 'hono';
import { environment } from './environment';

// `Cache-Control` se expresa en segundos. El repo no tiene un helper `parseDuration*`
// (ver typescript.md), así que —como en sitemap.controller— el valor va en segundos con
// la duración humana en comentario.

// SWR fijo (7 días): cubre la ventana entre que el purge-on-publish marca la entrada como
// stale y el CDN completa la revalidación en background. Sirve una respuesta stale-pero-usable
// al primer visitante post-purge en vez de bloquearlo contra el origen; más de unos días no
// aporta (tras el purge la revalidación es cuestión de segundos).
const READ_CACHE_STALE_WHILE_REVALIDATE = 604800; // 7 días

// El browser NO debe cachear la página con el TTL largo del CDN: el purge-on-publish solo
// alcanza el CDN de Vercel, así que un browser que fije la página por un año no vería la
// corrección. `max-age=0, must-revalidate` lo mantiene fresco (revalida contra el CDN en
// cada navegación); el TTL largo vive solo en `Vercel-CDN-Cache-Control` (que Vercel no
// reenvía al browser).
const BROWSER_CACHE_CONTROL = 'public, max-age=0, must-revalidate';

/**
 * Tag de caché por obra. Una única key agrupa todas las variantes (`?section=N`) de un slug,
 * de modo que un `invalidateByTag` al publicar purga la obra completa de una vez. Sin comas
 * (la coma es el delimitador de `Vercel-Cache-Tag`). Fuente única para el tagging (middleware
 * y controller) y para la purga (cache-purge service).
 */
export function literaryWorkCacheTag(slug: string): string {
	return `literary-work:${slug}`;
}

/**
 * Aplica a una respuesta cacheable de `/read` los headers de caché de borde:
 * - `Vercel-CDN-Cache-Control`: TTL largo (interruptor `environment.readCacheSMaxAge`) + SWR,
 *   efectivo solo en el CDN de Vercel — producción arranca conservador y sube a un año recién
 *   con el purge operativo (ver #1856 / LITERARY_WORK_DESIGN.md §8).
 * - `Cache-Control`: mantiene el browser fresco (ver `BROWSER_CACHE_CONTROL`).
 * - `Vercel-Cache-Tag`: etiqueta para la purga dirigida on-publish.
 */
export function applyReadCacheHeaders(c: Context, tag: string): void {
	c.header(
		'Vercel-CDN-Cache-Control',
		`public, s-maxage=${environment.readCacheSMaxAge}, stale-while-revalidate=${READ_CACHE_STALE_WHILE_REVALIDATE}`,
	);
	c.header('Cache-Control', BROWSER_CACHE_CONTROL);
	c.header('Vercel-Cache-Tag', tag);
}
