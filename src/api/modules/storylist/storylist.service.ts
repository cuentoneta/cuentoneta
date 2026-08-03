// Interfaces
import { Storylist, StorylistTeaser } from '@models/storylist.model';

// Funciones de repository
import { StoryListBySlugArgs } from '../../interfaces/queryArgs';
import { fetchAllStorylistTeasers, fetchStorylistBySlug } from './storylist.repository';

export async function getAllStorylistTeasers(): Promise<StorylistTeaser[]> {
	const result = await fetchAllStorylistTeasers();
	return result;
}

export async function getStorylistBySlug(args: StoryListBySlugArgs): Promise<Storylist> {
	const result = await fetchStorylistBySlug(args.slug);
	return result;
}
