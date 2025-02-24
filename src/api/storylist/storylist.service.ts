// Conector de Sanity
import { client } from '../_helpers/sanity-connector';

// Interfaces
import { PublicationNavigationTeaser, Storylist, StorylistTeaser } from '@models/storylist.model';

// Funciones
import { mapStorylist, mapStorylistNavigationTeasers, mapStorylistTeasers } from '../_utils/functions';

// Queries
import { storylistNavigationTeasersQuery, storylistQuery, storylistTeasersQuery } from '../_queries/storylist.query';
import { StoryListBySlugArgs } from '../interfaces/queryArgs';
import { StorylistNavigationTeasersQueryResult } from '../sanity/types';

async function fetchStorylistTeasers(): Promise<StorylistTeaser[]> {
	const result = await client.fetch(storylistTeasersQuery);
	return mapStorylistTeasers(result);
}

async function fetchBySlug(args: StoryListBySlugArgs): Promise<Storylist> {
	const result = await client.fetch(storylistQuery, { slug: args.slug });

	if (!result) {
		throw new Error(`Storylist with slug ${args.slug} not found`);
	}

	return mapStorylist(result);
}

async function fetchNavigation(args: {
	slug: string;
	limit: number;
	offset: number;
}): Promise<PublicationNavigationTeaser[]> {
	const result = await client.fetch(storylistNavigationTeasersQuery, {
		slug: args.slug,
		start: args.offset * args.limit,
		end: (args.offset + 1) * args.limit,
	});

	if (!result) {
		throw new Error(`Storylist with slug ${args.slug} not found`);
	}

	return mapStorylistNavigationTeasers(result);
}

export { fetchStorylistTeasers, fetchBySlug, fetchNavigation };
