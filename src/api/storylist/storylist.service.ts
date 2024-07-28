// Conector de Sanity
import { client } from '../_helpers/sanity-connector';

// Interfaces
import { StorylistDTO } from '@models/storylist.model';

// Funciones
import { mapStorylist } from '../_utils/functions';

// Queries
import { storylistPreviewQuery } from '../_queries/storylist.query';
import { StoryListBySlugArgs } from '../interfaces/queryArgs';

async function fetchPreviewBySlug(slug: string): Promise<StorylistDTO> {
	const query = `*[_type == 'storylist' && slug.current == '${slug}'][0]${storylistPreviewQuery}`;
	const result = await client.fetch(query, {});

	if (!result) {
		throw new Error('Storylist not found');
	}

	return mapStorylist(result);
}
async function fetchStorylistBySlugArgs(args: StoryListBySlugArgs): Promise<StorylistDTO> {
	const result = await client.fetch(storylistPreviewQuery, { slug: args.slug });

	if (!result) {
		throw new Error('Storylist not found');
	}

	return mapStorylist(result);
}

export { fetchPreviewBySlug, fetchStorylistBySlugArgs };
