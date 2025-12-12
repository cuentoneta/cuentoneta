// Interfaces
import { Storylist, StorylistPublicationsNavigationTeasers, StorylistTeaser } from '@models/storylist.model';

// Funciones de mapeo
import { mapStorylist, mapStorylistNavigationTeasers, mapStorylistTeasers } from '../../_utils/functions';

// Funciones de repository
import { StoryListBySlugArgs } from '../../interfaces/queryArgs';
import {
	fetchAllStorylistTeasers,
	fetchStorylistBySlug,
	fetchStorylistNavigationTeaserByStorylistSlug,
} from './storylist.repository';

// Excepciones
import { NotFoundError } from '../../exceptions/exceptions';

export async function getAllStorylistTeasers(): Promise<StorylistTeaser[]> {
	const result = await fetchAllStorylistTeasers();
	return mapStorylistTeasers(result);
}

export async function getStorylistBySlug(args: StoryListBySlugArgs): Promise<Storylist> {
	const result = await fetchStorylistBySlug(args.slug);

	if (!result) {
		throw new NotFoundError(`Storylist with slug ${args.slug} not found`);
	}

	return mapStorylist(result);
}

export async function getStorylistNavigationTeasersByStorylistSlug(args: {
	slug: string;
	limit: number;
	offset: number;
}): Promise<StorylistPublicationsNavigationTeasers> {
	const result = await fetchStorylistNavigationTeaserByStorylistSlug({
		slug: args.slug,
		start: args.offset * args.limit,
		end: (args.offset + 1) * args.limit,
	});

	if (!result) {
		throw new NotFoundError(`Storylist with slug ${args.slug} not found`);
	}

	return mapStorylistNavigationTeasers(result);
}
