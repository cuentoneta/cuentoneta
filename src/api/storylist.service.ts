// Conector de Sanity
import { client } from './_helpers/sanity-connector';

// Interfaces
import { StorylistDTO } from '@models/storylist.model';

// Funciones
import { mapStorylist } from './_utils/functions';

// Queries
import { storylistPreviewQuery, storylistQuery } from './_queries/storylist.query';

async function fetchPreview(slug: string): Promise<StorylistDTO> {
	const query = `*[_type == 'storylist' && slug.current == '${slug}'][0]${storylistPreviewQuery}`;
	const result = await client.fetch(query, {});

	if (!result) {
		throw new Error('Storylist not found');
	}

	return mapStorylist(result);
}
async function fetchStorylist({
	slug,
	amount,
	limit,
	ordering,
}: {
	slug: string;
	amount: string;
	limit: number;
	ordering: string;
}): Promise<StorylistDTO> {
	const query = `*[_type == 'storylist' && slug.current == '${slug}'][0]${storylistQuery}`;
	const result = await client.fetch(query, {});

	if (!result) {
		throw new Error('Storylist not found');
	}

	return mapStorylist(result);
}

export { fetchPreview, fetchStorylist };
