// Conexión a Sanity
import { client } from '../_helpers/sanity-connector';

// Utilidades
import { mapStoryContent, mapStoryTeaser } from '../_utils/functions';

// Modelos
import { Story, StoryNavigationTeaser, StoryTeaser } from '@models/story.model';

// Subqueries
import { storiesByAuthorSlugQuery, storyBySlugQuery } from '../_queries/story.query';

// Interfaces
import { StoriesByAuthorSlugArgs } from '../interfaces/queryArgs';

// Servicios
import * as contentService from '../content/content.service';
import { fetchClarityData } from '../_mocks/clarity.mock';

export async function fetchByAuthorSlug(args: StoriesByAuthorSlugArgs): Promise<StoryTeaser[]> {
	const result = await client.fetch(storiesByAuthorSlugQuery, {
		slug: args.slug,
		start: args.offset * args.limit,
		end: (args.offset + 1) * args.limit,
	});

	return mapStoryTeaser(result);
}

export async function fetchStoryBySlug(slug: string): Promise<Story> {
	const result = await client.fetch(storyBySlugQuery, { slug });

	if (!result) {
		throw new Error(`Story with slug ${slug} not found`);
	}

	return await mapStoryContent(result);
}

export async function fetchMostRead(limit: number = 6, offset: number = 0): Promise<StoryNavigationTeaser[]> {
	const result = await contentService.fetchLandingPageContent();

	if (!result) {
		throw new Error(`Could not fetch most read stories`);
	}

	return result.mostRead.slice(offset, offset + limit);
}

export async function updateMostRead(): Promise<void> {
	// TODO: Reemplazar implementación mock de la API de Clarity
	const mostReadStoriesSlugs = fetchClarityData();
	console.log(mostReadStoriesSlugs);

	throw new Error('Method not implemented');
}
