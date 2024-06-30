// Conexión a Sanity
import { client } from '../_helpers/sanity-connector';
import groq from 'groq';

// Utilidades
import { mapAuthorForStory, mapResources, mapStoryContent } from '../_utils/functions';

// Modelos
import { Story, StoryBase } from '@models/story.model';
import { mapMediaSources } from '../_utils/media-sources.functions';

// Subqueries
import { authorForStory } from '../_queries/author.query';
import { resourcesSubQuery } from '../_queries/resources.query';
import { storiesByAuthorSlugQuery, storyCommonFields } from '../_queries/story.query';

// Interfaces
import { StoriesByAuthorSlugArgs } from '../interfaces/queryArgs';
import { StoriesByAuthorSlugQueryResult } from '../sanity/types';

export async function fetchByAuthorSlug(args: StoriesByAuthorSlugArgs): Promise<StoryBase[]> {
	const slice = `${args.offset * args.limit}...${(args.offset + 1) * args.limit}`;

	const result: StoriesByAuthorSlugQueryResult = await client.fetch(storiesByAuthorSlugQuery, {
		slug: args.slug,
		slice: slice,
	});
	const stories = [];

	// Toma las publicaciones que fueron traídas en la consulta a Sanity y las mapea a una colección de publicaciones
	for (const story of result) {
		const { body, mediaSources, resources, ...properties } = story;

		stories.push({
			...properties,
			media: await mapMediaSources(mediaSources),
			resources: mapResources(resources),
			paragraphs: body,
		});
	}

	return stories;
}

export async function fetchStoryBySlug(slug: string): Promise<Story> {
	const query = groq`*[_type == 'story' && slug.current == '${slug}']
                          {
							${storyCommonFields},
                            ${resourcesSubQuery},
							${authorForStory}
                          }[0]`;

	const story = await client.fetch(query, {});

	const { body, review, author, mediaSources, ...properties } = story;

	return mapStoryContent({
		...properties,
		media: await mapMediaSources(mediaSources),
		author: mapAuthorForStory(author, properties.language),
		resources: mapResources(properties.resources),
		paragraphs: body,
		summary: review,
	});
}
