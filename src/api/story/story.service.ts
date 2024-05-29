// Conexión a Sanity
import { client } from '../_helpers/sanity-connector';
import groq from 'groq';

// Utilidades
import { mapAuthorForStory, mapResources } from '../_utils/functions';

// Modelos
import { StoryDTO } from '@models/story.model';
import { mapMediaSources } from '../_utils/media-sources.functions';

// Subqueries
import { authorForStory } from '../_queries/author.query';
import { resourcesSubQuery } from '../_queries/resources.query';
import { storyCommonFields, storyPreviewCommonFields } from '../_queries/story.query';

// Interfaces
import { StoryByAuthorSlugArgs } from './interfaces';

export async function fetchByAuthorSlug(args: StoryByAuthorSlugArgs): Promise<StoryDTO[]> {
	const slice = `${args.offset * args.limit}...${(args.offset + 1) * args.limit}`;
	const query = groq`*[_type == 'story' && author->slug.current == '${args.slug}'][${slice}]
						  {
							${storyPreviewCommonFields}
							${resourcesSubQuery},
						  } | order(title asc)`;

	const result = await client.fetch(query, {});
	const stories = [];

	// Toma las publicaciones que fueron traídas en la consulta a Sanity y las mapea a una colección de publicaciones
	for (const story of result) {
		const { body, review, mediaSources, ...properties } = story;

		stories.push({
			...properties,
			media: await mapMediaSources(mediaSources),
			resources: mapResources(properties.resources),
			paragraphs: body,
			summary: review,
		});
	}

	return stories;
}

export async function fetchForRead(slug: string): Promise<StoryDTO> {
	const query = groq`*[_type == 'story' && slug.current == '${slug}']
                          {
							${storyCommonFields},
                            ${resourcesSubQuery},
							${authorForStory}
                          }[0]`;
	const story = await client.fetch(query, {});

	const { body, review, author, mediaSources, ...properties } = story;

	return {
		...properties,
		media: await mapMediaSources(mediaSources),
		author: mapAuthorForStory(author, properties.language),
		resources: mapResources(properties.resources),
		paragraphs: body,
		summary: review,
	};
}
