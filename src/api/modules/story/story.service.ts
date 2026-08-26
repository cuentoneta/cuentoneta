// Utilidades
import {
	mapAuthorTeaser,
	mapBlockContentToTextParagraphs,
	mapStoryContent,
	mapStoryTeaser,
	mapStoryTeaserWithAuthor,
	urlFor,
} from '../../_utils/functions';

// Modelos
import { Story, StoryTeaser, StoryTeaserWithAuthor } from '@models/story.model';
import type { LiteraryWorkNavigationTeaserWithAuthors } from '@models/literary-work.model';

// Interfaces
import { StoriesByAuthorSlugArgs } from '../../interfaces/queryArgs';

// Servicios
import { getLandingPageContent } from '../content/content.service';

// Funciones de mapeo
import { mapMediaSources } from '../../_utils/media-sources.functions';

// Funciones de repository
import { fetchStories, fetchStoriesByAuthorSlug, fetchStoriesBySlugs, fetchStoryBySlug } from './story.repository';

export async function getStoriesByAuthorSlug(args: StoriesByAuthorSlugArgs): Promise<StoryTeaser[]> {
	const result = await fetchStoriesByAuthorSlug(args.slug, args.offset * args.limit, (args.offset + 1) * args.limit);

	return mapStoryTeaser(result);
}

export async function getStoryBySlug(slug: string): Promise<Story> {
	const result = await fetchStoryBySlug(slug);

	if (!result) {
		throw new Error(`Story with slug ${slug} not found`);
	}

	return await mapStoryContent(result);
}

export async function getStoriesBySlug(slugs: string[]): Promise<StoryTeaser[]> {
	const result = await fetchStoriesBySlugs(slugs);

	return mapStoryTeaser(result);
}

export async function getMostReadStoryNavigationTeasers(
	limit: number = 6,
	offset: number = 0,
): Promise<readonly LiteraryWorkNavigationTeaserWithAuthors[]> {
	const result = await getLandingPageContent();

	if (!result) {
		throw new Error(`Could not fetch most read stories.`);
	}

	return result.mostRead.slice(offset, offset + limit);
}

export async function getStories(limit: number = 100, offset: number = 0): Promise<StoryTeaserWithAuthor[]> {
	const result = await fetchStories(offset * limit, (offset + 1) * limit);

	return result.map((story) => {
		const { body, author, mediaSources, coverImage, ...fields } = story;

		return mapStoryTeaserWithAuthor({
			...fields,
			author: mapAuthorTeaser(author),
			coverImage: urlFor(coverImage),
			media: mapMediaSources(mediaSources),
			paragraphs: mapBlockContentToTextParagraphs(body),
			resources: [],
			tags: [],
		});
	});
}
