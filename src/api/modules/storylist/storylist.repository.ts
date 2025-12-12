// Sanity
import { client } from '../../_helpers/sanity-connector';

// Queries
import { storylistNavigationTeasersQuery, storylistQuery, storylistTeasersQuery } from '../../_queries/storylist.query';
import {
	StorylistNavigationTeasersQueryResult,
	StorylistQueryResult,
	StorylistTeasersQueryResult,
} from '../../sanity/types';

// Excepciones
import { InternalError } from '../../exceptions/exceptions';

export async function fetchAllStorylistTeasers(): Promise<StorylistTeasersQueryResult> {
	try {
		return await client.fetch(storylistTeasersQuery);
	} catch {
		throw new InternalError('Internal server error');
	}
}

export async function fetchStorylistBySlug(slug: string): Promise<StorylistQueryResult> {
	try {
		return await client.fetch(storylistQuery, { slug });
	} catch {
		throw new InternalError('Internal server error');
	}
}

type FetchStorylistNavigationTeasersByStorylistSlugParams = {
	slug: string;
	start: number;
	end: number;
};

export async function fetchStorylistNavigationTeaserByStorylistSlug(
	params: FetchStorylistNavigationTeasersByStorylistSlugParams,
): Promise<StorylistNavigationTeasersQueryResult> {
	try {
		return await client.fetch(storylistNavigationTeasersQuery, params);
	} catch {
		throw new InternalError('Internal server error');
	}
}
