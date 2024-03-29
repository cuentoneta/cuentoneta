// Conexión a Sanity
import { client } from './_helpers/sanity-connector';
import groq from 'groq';

// Utilidades
import { mapAuthor, mapMediaSources, mapPrologues, mapResources } from './_utils/functions';

// Modelos
import { StoryDTO } from '@models/story.model';

async function fetchForRead(slug: string): Promise<StoryDTO> {
	{
		const resourcesSubQuery: string = `                              	
								resources[]{ 
                              	title, 
                              	url, 
                              	resourceType->{ 
                              		title, 
                              		description, 
                              		'icon': { 
                              			'name': icon.name, 
                              			'svg': icon.svg, 
                              			'provider': icon.provider 
                              			} 
                              		} 
                              	} `;

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
                              'author': author-> {
                              	..., 
                              	nationality->, 
								${resourcesSubQuery}
                              }
                          }[0]`;
		const story = await client.fetch(query, {});

		const { body, review, author, forewords, mediaSources, ...properties } = story;

		return {
			...properties,
			media: await mapMediaSources(mediaSources),
			author: mapAuthor(author, properties.language),
			prologues: mapPrologues(forewords),
			resources: mapResources(properties.resources),
			paragraphs: body,
			summary: review,
		};
	}
}

export { fetchForRead };
