// Sanity
import { client } from '../../_helpers/sanity-connector';

// Queries
import {
	storiesByAuthorSlugQuery,
	storiesBySlugsQuery,
	storyBySlugQuery,
	storyNavigationTeasersByAuthorSlugQuery,
	allStoriesQuery,
} from '../../_queries/story.query';

/**
 * Fetches a single story by its slug
 */
export async function fetchBySlug(slug: string) {
	return client.fetch(storyBySlugQuery, { slug });
}

/**
 * Fetches stories by author slug with pagination support
 */
export async function fetchByAuthorSlug(slug: string, start: number, end: number) {
	return client.fetch(storiesByAuthorSlugQuery, { slug, start, end });
}

/**
 * Fetches story navigation teasers by author slug with pagination support
 */
export async function fetchNavigationTeasersByAuthorSlug(slug: string, start: number, end: number) {
	return client.fetch(storyNavigationTeasersByAuthorSlugQuery, { slug, start, end });
}

/**
 * Fetches stories by a list of slugs
 */
export async function fetchBySlugs(slugs: string[]) {
	return client.fetch(storiesBySlugsQuery, { slugs });
}

/**
 * Fetches all stories with pagination support
 */
export async function fetchAll(start: number, end: number) {
	return client.fetch(allStoriesQuery, { start, end });
}
