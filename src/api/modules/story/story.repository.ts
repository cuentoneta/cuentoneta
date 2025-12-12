// Sanity
import { InternalError } from '../../exceptions/exceptions';
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
	try {
		return await client.fetch(storyBySlugQuery, { slug });
	} catch (err) {
		throw new InternalError('Internal server error');
	}
}

export async function fetchStoriesByAuthorSlug(slug: string, start: number, end: number) {
	try {
		return await client.fetch(storiesByAuthorSlugQuery, { slug, start, end });
	} catch (err) {
		throw new InternalError('Internal server error');
	}
}

export async function fetchNavigationTeasersByAuthorSlug(slug: string, start: number, end: number) {
	try {
		return await client.fetch(storyNavigationTeasersByAuthorSlugQuery, { slug, start, end });
	} catch (err) {
		throw new InternalError('Internal server error');
	}
}

export async function fetchStoriesBySlugs(slugs: string[]) {
	try {
		return await client.fetch(storiesBySlugsQuery, { slugs });
	} catch (err) {
		throw new InternalError('Internal server error');
	}
}

export async function fetchStories(start: number, end: number) {
	try {
		return await client.fetch(allStoriesQuery, { start, end });
	} catch (err) {
		throw new InternalError('Internal server error');
	}
}
