// Sanity
import { client } from '../../_helpers/sanity-connector';

// Queries
import { storylistNavigationTeasersQuery, storylistQuery, storylistTeasersQuery } from '../../_queries/storylist.query';
import {
	StorylistNavigationTeasersQueryResult,
	StorylistQueryResult,
	StorylistTeasersQueryResult,
} from '../../sanity/types';

export async function fetchAllStorylistTeasers(): Promise<StorylistTeasersQueryResult> {
	return client.fetch(storylistTeasersQuery);
}

export async function fetchStorylistBySlug(slug: string): Promise<StorylistQueryResult> {
	return client.fetch(storylistQuery, { slug });
}

type FetchStorylistNavigationTeasersByStorylistSlugParams = {
	slug: string;
	start: number;
	end: number;
};
export async function fetchStorylistNavigationTeaserByStorylistSlug(
	params: FetchStorylistNavigationTeasersByStorylistSlugParams,
): Promise<StorylistNavigationTeasersQueryResult> {
	return client.fetch(storylistNavigationTeasersQuery, params);
}
