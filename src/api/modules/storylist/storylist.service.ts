// Interfaces
import { Storylist, StorylistPublicationsNavigationTeasers, StorylistTeaser } from '@models/storylist.model';

// Funciones de repository
import { StoryListBySlugArgs } from '../../interfaces/queryArgs';
import {
	fetchAllStorylistTeasers,
	fetchStorylistBySlug,
	fetchStorylistNavigationTeaserByStorylistSlug,
} from './storylist.repository';

export async function getAllStorylistTeasers(): Promise<StorylistTeaser[]> {
	const result = await fetchAllStorylistTeasers();
	return result;
}

export async function getStorylistBySlug(args: StoryListBySlugArgs): Promise<Storylist> {
	const result = await fetchStorylistBySlug(args.slug);
	return result;
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

	return result;
}
