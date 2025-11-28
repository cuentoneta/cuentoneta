// Sanity
import { client } from '../../_helpers/sanity-connector';

// Queries
import { storylistNavigationTeasersQuery, storylistQuery, storylistTeasersQuery } from '../../_queries/storylist.query';
import {
	StorylistNavigationTeasersQueryResult,
	StorylistQueryResult,
	StorylistTeasersQueryResult,
} from '../../sanity/types';

/**
 * Fetches all storylist teasers
 */
export async function fetchTeasers(): Promise<StorylistTeasersQueryResult> {
	return client.fetch(storylistTeasersQuery);
}

/**
 * Fetches a single storylist by slug
 */
export async function fetchBySlug(slug: string): Promise<StorylistQueryResult> {
	return client.fetch(storylistQuery, { slug });
}

/**
 * Fetches storylist navigation teasers with pagination support
 */
export async function fetchNavigation(
	slug: string,
	start: number,
	end: number,
): Promise<StorylistNavigationTeasersQueryResult> {
	return client.fetch(storylistNavigationTeasersQuery, { slug, start, end });
}
