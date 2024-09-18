// Conector de Sanity
import { client } from '../_helpers/sanity-connector';

// Interfaces
import { Storylist, StorylistTeaser } from '@models/storylist.model';

// Funciones
import { mapStorylist, mapStorylistTeasers } from '../_utils/functions';

// Queries
import { storylistQuery, storylistTeasersQuery } from '../_queries/storylist.query';
import { StoryListBySlugArgs } from '../interfaces/queryArgs';
import { StorylistQueryResult, StorylistTeasersQueryResult } from '../sanity/generated-query-types';

async function fetchStorylistTeasers(): Promise<StorylistTeaser[]> {
	const result: StorylistTeasersQueryResult = await client.fetch(storylistTeasersQuery);
	return mapStorylistTeasers(result);
}

async function fetchBySlug(args: StoryListBySlugArgs): Promise<Storylist> {
	const result: StorylistQueryResult = await client.fetch(storylistQuery, { slug: args.slug });

	if (!result) {
		throw new Error(`Storylist with slug ${args.slug} not found`);
	}

	return mapStorylist(result);
}

export { fetchStorylistTeasers, fetchBySlug };
