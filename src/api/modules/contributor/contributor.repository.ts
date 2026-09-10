// Sanity
import { client } from '../../_helpers/sanity-connector';
import { allContributorsQuery } from '@queries/contributor.query';

// Interfaces
import type { Contributor } from '@models/contributor.model';
import { CONTRIBUTOR_AREA_LABELS } from '@models/contributor.model';

/**
 * Obtiene todos los colaboradores ordenados alfabéticamente por nombre
 */
export async function fetchAllContributors(): Promise<Contributor[]> {
	const result = await client.fetch(allContributorsQuery);

	if (!result) {
		throw new Error('Could not fetch the list of contributors.');
	}

	return result.map((contributor) => ({
		slug: contributor.slug,
		name: contributor.name,
		area: { slug: contributor.area, name: CONTRIBUTOR_AREA_LABELS[contributor.area] },
		link: {
			handle: contributor.link?.handle || undefined,
			url: contributor.link?.url || undefined,
		},
		notes: contributor.notes || undefined,
	}));
}
