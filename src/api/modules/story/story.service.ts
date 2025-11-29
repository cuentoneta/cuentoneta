// Environment
import { environment } from '../../_helpers/environment';

// Utilidades
import {
	mapAuthorTeaser,
	mapBlockContentToTextParagraphs,
	mapStoryContent,
	mapStoryNavigationTeaser,
	mapStoryTeaser,
	mapStoryTeaserWithAuthor,
} from '../../_utils/functions';

// Modelos
import { Story, StoryNavigationTeaser, StoryTeaser, StoryTeaserWithAuthor } from '@models/story.model';

// Interfaces
import { RotatingContent } from '@models/landing-page-content.model';
import { StoriesByAuthorSlugArgs } from '../../interfaces/queryArgs';

// Servicios
import { getLandingPageContent, getRotatingContent } from '../content/content.service';
import { fetchClarityData } from '../../_helpers/clarity-connector';

// Repository
import { updateRotatingContentMostRead } from '../content/content.repository';

// Funciones de mapeo
import { mapMediaSourcesForStorylist } from '../../_utils/media-sources.functions';

// Funciones de repository
import {
	fetchNavigationTeasersByAuthorSlug,
	fetchStories,
	fetchStoriesByAuthorSlug,
	fetchStoriesBySlugs,
	fetchStoryBySlug,
} from './story.repository';

export async function getStoriesByAuthorSlug(args: StoriesByAuthorSlugArgs): Promise<StoryTeaser[]> {
	const result = await fetchStoriesByAuthorSlug(args.slug, args.offset * args.limit, (args.offset + 1) * args.limit);

	return mapStoryTeaser(result);
}

export async function getStoryNavigationTeaserByAuthorSlug(args: {
	slug: string;
	limit: number;
	offset: number;
}): Promise<StoryNavigationTeaser[]> {
	const result = await fetchNavigationTeasersByAuthorSlug(
		args.slug,
		args.offset * args.limit,
		(args.offset + 1) * args.limit,
	);

	return mapStoryNavigationTeaser(result);
}

export async function getStoryBySlug(slug: string): Promise<Story> {
	const result = await fetchStoryBySlug(slug);

	if (!result) {
		throw new Error(`Story with slug ${slug} not found`);
	}

	return await mapStoryContent(result);
}

export async function getStoriesBySlug(slugs: string[]): Promise<StoryTeaser[]> {
	const result = await fetchStoriesBySlugs(slugs);

	return mapStoryTeaser(result);
}

export async function getMostReadStoryNavigationTeasers(
	limit: number = 6,
	offset: number = 0,
): Promise<StoryNavigationTeaser[]> {
	const result = await getLandingPageContent();

	if (!result) {
		throw new Error(`Could not fetch most read stories.`);
	}

	return result.mostRead.slice(offset, offset + limit);
}

export async function updateMostReadStories(): Promise<RotatingContent> {
	const popularPagesMetrics = (await fetchClarityData()).find((metric) => metric.metricName === 'PopularPages');
	if (!popularPagesMetrics) {
		throw new Error('Could not fetch metrics.');
	}

	const prefix = `${environment.basePath}/story/`;
	const mostReadStoriesSlugs = popularPagesMetrics.information
		.filter((entry) => entry.url.startsWith(prefix))
		.map((entry) => entry.url.split(prefix).pop() as string);

	const stories = await getStoriesBySlug(mostReadStoriesSlugs);

	// Actualiza landing page referencias a las historias marcadas como "más leídas" actuales
	const mostReadStories = stories.map((s) => ({ _key: s._id, _type: 'story', _ref: s._id }));
	await updateRotatingContentMostRead(mostReadStories);

	return await getRotatingContent();
}

export async function getStories(limit: number = 100, offset: number = 0): Promise<StoryTeaserWithAuthor[]> {
	const result = await fetchStories(offset * limit, (offset + 1) * limit);

	return result.map((story) => {
		const { body, author, mediaSources, ...fields } = story;

		return mapStoryTeaserWithAuthor({
			...fields,
			author: mapAuthorTeaser(author),
			media: mapMediaSourcesForStorylist(mediaSources),
			paragraphs: mapBlockContentToTextParagraphs(body),
			resources: [],
		});
	});
}
