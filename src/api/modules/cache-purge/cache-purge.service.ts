import { literaryWorkCacheTag } from '../../_helpers/cache-control';
import type { CachePurgeRepository } from './cache-purge.repository';

/**
 * Purga la caché de borde de una obra a partir de su slug. Traduce slug → tag con la misma
 * fuente que el tagging de las respuestas (`literaryWorkCacheTag`), de modo que la purga y el
 * etiquetado no puedan divergir. Un único tag por obra cubre todas sus variantes `?section=N`.
 */
export async function purgeLiteraryWorkCache(slug: string, repository: CachePurgeRepository): Promise<void> {
	await repository.purgeByTag(literaryWorkCacheTag(slug));
}
