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

export async function fetchStoryBySlug(slug: string) {
	return client.fetch(storyBySlugQuery, { slug });
}

export async function fetchStoriesByAuthorSlug(slug: string, start: number, end: number) {
	return client.fetch(storiesByAuthorSlugQuery, { slug, start, end });
}

export async function fetchNavigationTeasersByAuthorSlug(slug: string, start: number, end: number) {
	return client.fetch(storyNavigationTeasersByAuthorSlugQuery, { slug, start, end });
}

export async function fetchStoriesBySlugs(slugs: string[]) {
	return client.fetch(storiesBySlugsQuery, { slugs });
}

export async function fetchStories(start: number, end: number) {
	return client.fetch(allStoriesQuery, { start, end });
}
