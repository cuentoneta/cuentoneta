// Conexión a Sanity
import { client } from '../_helpers/sanity-connector';

// Utilidades
import { mapAuthor, mapResources, mapStoryContent } from '../_utils/functions';

// Modelos
import { Epigraph, Story, StoryBase } from '@models/story.model';
import { mapMediaSources, mapMediaSourcesForStorylist } from '../_utils/media-sources.functions';

// Subqueries
import { storiesByAuthorSlugQuery, storyBySlugQuery } from '../_queries/story.query';

// Interfaces
import { TextBlockContent } from '@models/block-content.model';
import { StoriesByAuthorSlugArgs } from '../interfaces/queryArgs';
import { StoriesByAuthorSlugQueryResult, StoryBySlugQueryResult } from '../sanity/types';

export async function fetchByAuthorSlug(args: StoriesByAuthorSlugArgs): Promise<StoryBase[]> {
	const result: StoriesByAuthorSlugQueryResult = await client.fetch(storiesByAuthorSlugQuery, {
		slug: args.slug,
		start: args.offset * args.limit,
		end: (args.offset + 1) * args.limit,
	});
	const stories = [];

	// Toma las publicaciones que fueron traídas en la consulta a Sanity y las mapea a una colección de publicaciones
	for (const story of result) {
		const { body, mediaSources, resources, ...properties } = story;

		stories.push({
			...properties,
			media: mapMediaSourcesForStorylist(mediaSources),
			resources: mapResources(resources),
			paragraphs: body,
		});
	}

	return stories;
}

export async function fetchStoryBySlug(slug: string): Promise<Story> {
	const result: StoryBySlugQueryResult = await client.fetch(storyBySlugQuery, { slug });

	const { body, review, author, mediaSources, epigraphs, ...properties } = result;

	return mapStoryContent({
		...properties,
		media: await mapMediaSources(mediaSources),
		author: mapAuthor(author, properties.language),
		resources: mapResources(properties.resources),
		paragraphs: body as TextBlockContent[],
		summary: review as TextBlockContent[],
		epigraphs: epigraphs as Epigraph[],
	});
}
