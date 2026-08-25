// Environment
import { environment } from '../../_helpers/environment';

// Utilidades
import {
	mapAuthorTeaser,
	mapBlockContentToTextParagraphs,
	mapStoryContent,
	mapStoryTeaser,
	mapStoryTeaserWithAuthor,
	urlFor,
} from '../../_utils/functions';

// Modelos
import { Story, StoryTeaser, StoryTeaserWithAuthor } from '@models/story.model';
import type { LiteraryWorkNavigationTeaserWithAuthors } from '@models/literary-work.model';

// Interfaces
import { RotatingContent } from '@models/landing-page-content.model';
import { StoriesByAuthorSlugArgs } from '../../interfaces/queryArgs';

// Servicios
import { getLandingPageContent, getRotatingContent } from '../content/content.service';
import { fetchClarityData } from '../../_helpers/clarity-connector';

// Repositories
import type { ContentRepository } from '../content/content.repository';
import { SanityContentRepository } from '../content/content.repository.sanity';
import type { LiteraryWorkRepository } from '../literary-work/literary-work.repository';
import { SanityLiteraryWorkRepository } from '../literary-work/literary-work.repository.sanity';

// Funciones de mapeo
import { mapMediaSources } from '../../_utils/media-sources.functions';

// Funciones de repository
import { fetchStories, fetchStoriesByAuthorSlug, fetchStoriesBySlugs, fetchStoryBySlug } from './story.repository';

export async function getStoriesByAuthorSlug(args: StoriesByAuthorSlugArgs): Promise<StoryTeaser[]> {
	const result = await fetchStoriesByAuthorSlug(args.slug, args.offset * args.limit, (args.offset + 1) * args.limit);

	return mapStoryTeaser(result);
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
): Promise<readonly LiteraryWorkNavigationTeaserWithAuthors[]> {
	const result = await getLandingPageContent();

	if (!result) {
		throw new Error(`Could not fetch most read stories.`);
	}

	return result.mostRead.slice(offset, offset + limit);
}

// Las dos rutas de lectura conviven mientras dure la migración y el tráfico está repartido entre
// ellas, así que se leen ambos prefijos: quedarse con uno solo vaciaría la lista a medida que los
// lectores se corren a la otra. La obra migrada conserva el slug de su historia de origen, y por eso
// el mismo slug puede llegar por los dos caminos y se deduplica antes de resolverlo.
export async function updateMostReadStories(
	contentRepository: ContentRepository = new SanityContentRepository(),
	literaryWorkRepository: LiteraryWorkRepository = new SanityLiteraryWorkRepository(),
): Promise<RotatingContent> {
	const popularPagesMetrics = (await fetchClarityData()).find((metric) => metric.metricName === 'PopularPages');
	if (!popularPagesMetrics) {
		throw new Error('Could not fetch metrics.');
	}

	const readingPathPrefixes = [`${environment.basePath}/story/`, `${environment.basePath}/read/`];
	const slugs = new Set(
		popularPagesMetrics.information.flatMap((entry) => {
			const prefix = readingPathPrefixes.find((candidate) => entry.url.startsWith(candidate));
			return prefix ? [entry.url.slice(prefix.length)] : [];
		}),
	);

	const literaryWorks = await literaryWorkRepository.fetchIdsBySlugs([...slugs]);

	await contentRepository.updateMostReadLiteraryWorks(
		literaryWorks.map(({ _id }) => ({ _key: _id, _type: 'reference' as const, _ref: _id })),
	);

	return await getRotatingContent(contentRepository);
}

export async function getStories(limit: number = 100, offset: number = 0): Promise<StoryTeaserWithAuthor[]> {
	const result = await fetchStories(offset * limit, (offset + 1) * limit);

	return result.map((story) => {
		const { body, author, mediaSources, coverImage, ...fields } = story;

		return mapStoryTeaserWithAuthor({
			...fields,
			author: mapAuthorTeaser(author),
			coverImage: urlFor(coverImage),
			media: mapMediaSources(mediaSources),
			paragraphs: mapBlockContentToTextParagraphs(body),
			resources: [],
			tags: [],
		});
	});
}
