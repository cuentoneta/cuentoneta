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

	return result.mostReadLiteraryWorks.slice(offset, offset + limit);
}

// Clarity reporta la URL visitada, no el slug: puede traer querystring de campaña, un ancla a una
// sección o una barra final, y ninguna de las tres formas resuelve contra `slug.current`. Sin
// normalizar, la obra más leída desaparece del ranking justo cuando llega tráfico de campaña.
function slugFromReadingUrl(url: string, prefixes: readonly string[]): string | undefined {
	const prefix = prefixes.find((candidate) => url.startsWith(candidate));
	if (prefix === undefined) {
		return undefined;
	}
	const [path] = url.slice(prefix.length).split(/[?#]/);
	const slug = path.replace(/\/+$/, '');
	return slug === '' ? undefined : slug;
}

// Las dos rutas de lectura conviven mientras dure la migración y el tráfico está repartido entre
// ellas, así que se leen ambos prefijos: quedarse con uno solo vaciaría la lista a medida que los
// lectores se corren a la otra. La obra migrada conserva el slug de su historia de origen, y por eso
// el mismo slug puede llegar por los dos caminos y se deduplica antes de resolverlo.
export async function updateMostReadStories(
	contentRepository: ContentRepository = new SanityContentRepository(),
): Promise<RotatingContent> {
	const popularPagesMetrics = (await fetchClarityData()).find((metric) => metric.metricName === 'PopularPages');
	if (!popularPagesMetrics) {
		throw new Error('Could not fetch metrics.');
	}

	const readingPathPrefixes = [`${environment.basePath}/story/`, `${environment.basePath}/read/`];
	// El `Set` conserva el orden de inserción, que es el de Clarity: la deduplicación no reordena, y el
	// orden **es** el ranking.
	const rankedSlugs = [
		...new Set(
			popularPagesMetrics.information.flatMap((entry) => slugFromReadingUrl(entry.url, readingPathPrefixes) ?? []),
		),
	];

	await contentRepository.updateMostReadLiteraryWorks(rankedSlugs);

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
