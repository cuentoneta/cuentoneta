// Sanity
import { client } from '../../_helpers/sanity-connector';
import { allContributorsQuery } from '../../_queries/contributor.query';

// Interfaces
import { Contributor } from '@models/contributor.model';

/**
 * Obtiene todos los colaboradores ordenados alfabéticamente por nombre
 */
export async function getAll(): Promise<Contributor[]> {
	const result = await client.fetch(allContributorsQuery);

	if (!result || result.length === 0) {
		return [];
	}

	return result.map((contributor: any) => ({
		slug: contributor.slug.current,
		name: contributor.name,
		area: contributor.area,
		link: {
			handle: contributor.link?.handle || undefined,
			url: contributor.link?.url || undefined,
		},
		notes: contributor.notes || undefined,
	}));
}
