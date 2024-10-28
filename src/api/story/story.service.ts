// Conexión a Sanity
import { client } from '../_helpers/sanity-connector';

// Utilidades
import { mapStoryContent, mapStoryTeaser } from '../_utils/functions';

// Modelos
import { Story, StoryTeaser } from '@models/story.model';

// Subqueries
import { storiesByAuthorSlugQuery, storyBySlugQuery } from '../_queries/story.query';

// Interfaces
import { StoriesByAuthorSlugArgs } from '../interfaces/queryArgs';

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
