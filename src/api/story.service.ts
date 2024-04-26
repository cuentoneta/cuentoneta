// Conexión a Sanity
import { client } from './_helpers/sanity-connector';
import groq from 'groq';

// Utilidades
import { mapAuthorForStory, mapMediaSources, mapPrologues, mapResources } from './_utils/functions';

// Modelos
import { StoryDTO } from '@models/story.model';

// Subqueries
import { authorForStory } from './_queries/author.query';
import { resourcesSubQuery } from './_queries/resources.query';

export async function fetchByAuthorSlug(slug: string): Promise<StoryDTO[]> {
	const query = groq`*[_type == 'story' && author->slug.current == '${slug}']
						  {
							  'slug': slug.current,
							  title, 
							  language,
							  videoUrl,
							  badLanguage,
							  forewords, 
							  categories, 
							  body[0...2], 
							  approximateReadingTime,
							  mediaSources,
							  ${resourcesSubQuery},
						  }`;

	const result = await client.fetch(query, {});
	const stories = [];

	console.log(result);
	// Toma las publicaciones que fueron traídas en la consulta a Sanity y las mapea a una colección de publicaciones
	for (const story of result) {
		const { body, review, author, forewords, mediaSources, ...properties } = story;

		stories.push({
			...properties,
			media: await mapMediaSources(mediaSources),
			prologues: mapPrologues(forewords),
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
                              'slug': slug.current,
                              title, 
                              language,
                              videoUrl,
                              badLanguage,
                              forewords, 
                              categories, 
                              body, 
                              review, 
                              forewords, 
                              approximateReadingTime,
                              mediaSources,
                              ${resourcesSubQuery},
							  ${authorForStory}
                          }[0]`;
	const story = await client.fetch(query, {});

	const { body, review, author, forewords, mediaSources, ...properties } = story;

	return {
		...properties,
		media: await mapMediaSources(mediaSources),
		author: mapAuthorForStory(author, properties.language),
		prologues: mapPrologues(forewords),
		resources: mapResources(properties.resources),
		paragraphs: body,
		summary: review,
	};
}
