import type { CachePurgeRepository } from './cache-purge.repository';

/**
 * Doble que registra los tags que se le pidió purgar, para verificar la coordinación del
 * service/controller sin llamar al SDK real de Vercel.
 */
export class SpyCachePurgeRepository implements CachePurgeRepository {
	public readonly purgedTags: string[] = [];

	public async purgeByTag(tag: string): Promise<void> {
		this.purgedTags.push(tag);
	}
}
