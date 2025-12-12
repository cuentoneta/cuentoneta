// Sanity
import { InternalError } from '../../exceptions/exceptions';
import { client } from '../../_helpers/sanity-connector';
import { allContributorsQuery } from '../../_queries/contributor.query';

// Interfaces
import { Contributor, CONTRIBUTOR_AREA_LABELS } from '@models/contributor.model';

/**
 * Obtiene todos los colaboradores ordenados alfabéticamente por nombre
 */
export async function fetchAllContributors(): Promise<Contributor[] | null> {
	try {
		const result = await client.fetch(allContributorsQuery);

		if (!result) {
			return null;
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
	} catch (err) {
		console.error('Internal server error: ', err);
		throw new InternalError('Internal server error');
	}
}
