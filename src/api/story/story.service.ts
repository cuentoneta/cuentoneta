// Conexión a Sanity
import { client } from '../_helpers/sanity-connector';
import { environment } from '../_helpers/environment';

// Utilidades
import { mapStoryContent, mapStoryTeaser } from '../_utils/functions';

// Modelos
import { Story, StoryNavigationTeaser, StoryTeaser } from '@models/story.model';

// Subqueries
import { storiesByAuthorSlugQuery, storiesBySlugsQuery, storyBySlugQuery } from '../_queries/story.query';

// Interfaces
import { LandingPageContent } from '@models/landing-page-content.model';
import { StoriesByAuthorSlugArgs } from '../interfaces/queryArgs';

// Servicios
import * as contentService from '../content/content.service';
import { fetchLandingPageContent } from '../content/content.service';
import { fetchClarityData } from '../_helpers/clarity-connector';

export async function fetchByAuthorSlug(args: StoriesByAuthorSlugArgs): Promise<StoryTeaser[]> {
	const result = await client.fetch(storiesByAuthorSlugQuery, {
		slug: args.slug,
		start: args.offset * args.limit,
		end: (args.offset + 1) * args.limit,
	});

	return mapStoryTeaser(result);
}

export async function fetchStoryBySlug(slug: string): Promise<Story> {
	const result = await client.fetch(storyBySlugQuery, { slug });

	if (!result) {
		throw new Error(`Story with slug ${slug} not found`);
	}

	return await mapStoryContent(result);
}

export async function fetchStoriesBySlugs(slugs: string[]): Promise<StoryTeaser[]> {
	const result = await client.fetch(storiesBySlugsQuery, { slugs });

	return mapStoryTeaser(result);
}

export async function fetchMostRead(limit: number = 6, offset: number = 0): Promise<StoryNavigationTeaser[]> {
	const result = await contentService.fetchLandingPageContent();

	if (!result) {
		throw new Error(`Could not fetch most read stories`);
	}

	return result.mostRead.slice(offset, offset + limit);
}

export async function updateMostRead(): Promise<LandingPageContent> {
	const popularPagesMetrics = (await fetchClarityData()).find((metric) => metric.metricName === 'PopularPages');
	if (!popularPagesMetrics) {
		throw new Error('Could not fetch metrics from Microsoft Clarity');
	}

	const prefix = `${environment.basePath}/story/`;
	const mostReadStoriesSlugs = popularPagesMetrics.information
		.filter((entry) => entry.url.startsWith(prefix))
		.map((entry) => entry.url.split(prefix).pop() as string);

	const stories = await fetchStoriesBySlugs(mostReadStoriesSlugs);
	const landingPage = await contentService.fetchLandingPageContent();

	// Elimina las historias marcadas como "más leídas" actuales desde landing page
	await client.patch(landingPage._id, { unset: ['mostRead'] }).commit();

	// Actualiza landing page referencias a las historias marcadas como "más leídas" actuales
	const mostReadStories = stories.map((s) => ({ _key: s._id, _type: 'story', _ref: s._id }));
	await client.patch(landingPage._id, { set: { mostRead: mostReadStories } }).commit();

	return await fetchLandingPageContent();
}
