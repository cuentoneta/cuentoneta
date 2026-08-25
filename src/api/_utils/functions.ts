// Conector a Sanity
import { client } from '../_helpers/sanity-connector';

// Funciones
import { mapMediaSources } from './media-sources.functions';
import { mapImagery } from './storylist-imagery.functions';

// Tipos de Sanity

// Sanity utils
import { createImageUrlBuilder, SanityImageSource } from '@sanity/image-url';

// Modelos
import { Author, AuthorProfile, AuthorTeaser } from '@models/author.model';
import { ContentCampaign, viewportElementSizes } from '@models/content-campaign.model';
import type { HighlightedAuthor, LandingPageContent, RotatingContent } from '@models/landing-page-content.model';
import { StorylistTeaser } from '@models/storylist.model';
import { Resource } from '@models/resource.model';
import { Story, StoryNavigationTeaserWithAuthor, StoryTeaser, StoryTeaserWithAuthor } from '@models/story.model';
import { Tag } from '@models/tag.model';
import { TextBlockContent } from '@models/block-content.model';
import { createMarkdown } from '@models/markdown.model';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';

// Tipos de Sanity
import {
	AuthorBySlugQueryResult,
	AuthorsQueryResult,
	BlockContent,
	CollectionBySlugQueryResult,
	LandingPageContentQueryResult,
	LiteraryWorkBySlugQueryResult,
	RotatingContentQueryResult,
	StoriesByAuthorSlugQueryResult,
	StoriesBySlugsQueryResult,
	StoryBySlugQueryResult,
	StorylistQueryResult,
	StorylistTeasersQueryResult,
} from '@sanity-types';

// Tipos de datos
import { DateString, IsoDateTime } from '@utils/date.utils';

// Unwrapper de tipos definidos en Array<...>
type UnwrapArray<A> = A extends unknown[] ? UnwrapArray<A[number]> : A;

// Acepta el autor crudo sin los timestamps de ficha (los proyecta solo `authorBySlugQuery`, no el
// autor embebido en `storyBySlugQuery`), para que ambos orígenes compartan este mapper de dominio.
export function mapAuthor(
	rawAuthorData: Omit<NonNullable<AuthorBySlugQueryResult>, 'createdAt' | 'updatedAt'>,
): Author {
	const resources = mapResources(rawAuthorData.resources);
	// Sin fallback a cadena vacía: el campo es requerido en el schema, y `createMarkdown` lanza si
	// alguna vez llegara vacío en lugar de dejar pasar un autor sin biografía.
	const biography = markdownToSanitizedHtml(createMarkdown(rawAuthorData.biography));

	return {
		_id: rawAuthorData._id,
		slug: rawAuthorData.slug,
		nationality: {
			country: rawAuthorData.nationality?.country,
			flag: urlFor(rawAuthorData.nationality.flag),
		},
		resources: resources,
		tags: mapTags(rawAuthorData.tags),
		imageUrl: urlFor(rawAuthorData.image),
		name: rawAuthorData.name,
		biography: biography,
		bornOn: rawAuthorData.bornOn ? (rawAuthorData.bornOn as DateString) : undefined,
		diedOn: rawAuthorData.diedOn ? (rawAuthorData.diedOn as DateString) : undefined,
		bornOnYear: rawAuthorData.bornOnYear ?? undefined,
		diedOnYear: rawAuthorData.diedOnYear ?? undefined,
	};
}

// Variante para la página de perfil: agrega las fechas de la ficha sobre el `Author` base.
export function mapAuthorProfile(rawAuthorData: NonNullable<AuthorBySlugQueryResult>): AuthorProfile {
	return {
		...mapAuthor(rawAuthorData),
		createdAt: rawAuthorData.createdAt as IsoDateTime,
		updatedAt: rawAuthorData.updatedAt as IsoDateTime,
	};
}
type AuthorTeaserForStoriesSubQuery = NonNullable<StorylistQueryResult>['stories'][0]['author'];
type AuthorTeaserForListSubQuery = UnwrapArray<AuthorsQueryResult>;
type AuthorTeaserForCollectionSubQuery =
	NonNullable<CollectionBySlugQueryResult>['literaryWorks'][number]['authors'][number];
type AuthorTeaserForHighlightSubQuery = HighlightedAuthorsSubQuery[number]['author'];
export function mapAuthorTeaser(
	rawAuthorData:
		| AuthorTeaserForStoriesSubQuery
		| AuthorTeaserForListSubQuery
		| AuthorTeaserForCollectionSubQuery
		| AuthorTeaserForHighlightSubQuery,
): AuthorTeaser {
	return {
		_id: rawAuthorData._id,
		slug: rawAuthorData.slug,
		nationality: {
			country: rawAuthorData.nationality?.country,
			flag: urlFor(rawAuthorData.nationality.flag),
		},
		resources: [],
		tags: [],
		imageUrl: urlFor(rawAuthorData.image),
		name: rawAuthorData.name,
		bornOn: rawAuthorData.bornOn ? (rawAuthorData.bornOn as DateString) : undefined,
		diedOn: rawAuthorData.diedOn ? (rawAuthorData.diedOn as DateString) : undefined,
		bornOnYear: rawAuthorData.bornOnYear ?? undefined,
		diedOnYear: rawAuthorData.diedOnYear ?? undefined,
	};
}

export function urlFor(source: SanityImageSource): string {
	if (!source) {
		console.warn('urlFor: Se recibió source vacío o nulo');
		return '';
	}
	try {
		return createImageUrlBuilder(client).image(source).url();
	} catch (error) {
		console.error('urlFor: Error al construir URL de imagen', { error, source: JSON.stringify(source) });
		return '';
	}
}

export function urlForWithAutoFormat(source: SanityImageSource): string {
	if (!source) {
		console.warn('urlForWithAutoFormat: Se recibió source vacío o nulo');
		return '';
	}
	try {
		return createImageUrlBuilder(client).image(source).auto('format').url();
	} catch (error) {
		console.error('urlForWithAutoFormat: Error al construir URL de imagen', {
			error,
			source: JSON.stringify(source),
		});
		return '';
	}
}

type ResourcesSubQuery = (
	| NonNullable<AuthorBySlugQueryResult>
	| NonNullable<StoryBySlugQueryResult>
	| NonNullable<StoryBySlugQueryResult>['author']
	| NonNullable<StorylistQueryResult>['stories'][0]
	| NonNullable<LiteraryWorkBySlugQueryResult>
	| StoriesByAuthorSlugQueryResult[0]
)['resources'];
type RawResource = NonNullable<ResourcesSubQuery>[number];

// El typegen deriva `url: string` del `Rule.required()` del schema, pero esa regla valida la edición
// en el Studio, no lo ya almacenado: hay documentos persistidos sin URL. El tipo miente, y sin este
// guard la ausencia cruza la frontera y revienta al primer consumidor que la lea como string.
function hasUrl(resource: RawResource): boolean {
	return typeof resource.url === 'string' && resource.url.length > 0;
}

export function mapResources(resources: ResourcesSubQuery): Resource[] {
	const discarded = resources?.filter((resource) => !hasUrl(resource)) ?? [];
	if (discarded.length > 0) {
		// Solo el título: el resto de los campos del recurso descartado son tan poco confiables como la
		// URL que falta, y esta rama existe justamente para no lanzar.
		console.warn('mapResources: se descartan recursos sin URL', { titles: discarded.map((r) => r.title) });
	}

	return (
		resources?.filter(hasUrl).map((resource) => ({
			title: resource.title,
			url: resource.url,
			resourceType: {
				slug: resource.resourceType.slug,
				title: resource.resourceType.title,
				description: resource.resourceType.description,
			},
		})) ?? []
	);
}

type TagsSubQuery =
	| NonNullable<StoryBySlugQueryResult>['tags']
	| NonNullable<AuthorBySlugQueryResult>['tags']
	| NonNullable<StorylistTeasersQueryResult>[0]['tags']
	| NonNullable<LiteraryWorkBySlugQueryResult>['tags']
	| NonNullable<CollectionBySlugQueryResult>['tags']
	| NonNullable<CollectionBySlugQueryResult>['literaryWorks'][number]['tags']
	| HighlightedAuthorsSubQuery[number]['additionalTags']
	| HighlightedAuthorsSubQuery[number]['author']['tags'];
export function mapTags(tags: TagsSubQuery): Tag[] {
	return tags.map((tag) => ({
		title: tag.title,
		slug: tag.slug,
		description: tag.description,
	}));
}

function mapStorylistTeasers(result: StorylistTeasersQueryResult): StorylistTeaser[] {
	return result.map((item) => {
		const { featuredImage, storyCoverImages, mediaSources, ...rest } = item;
		return {
			...rest,
			config: { ...item.config, showAuthors: item.config?.showAuthors ?? false },
			description: mapBlockContentToTextParagraphs(item.description),
			tags: mapTags(item.tags),
			stories: [],
			tabs: [],
			media: mapMediaSources(mediaSources),
			imagery: mapImagery({ featuredImage, storyCoverImages }),
		};
	});
}

// TODO: Agregar soporte a futuro para mapear imágenes dentro del cuerpo de una story
export function mapBlockContentToTextParagraphs(content: BlockContent): TextBlockContent[] {
	return content.filter((element) => element._type === 'block') as TextBlockContent[];
}

export async function mapStoryContent(result: NonNullable<StoryBySlugQueryResult>): Promise<Story> {
	const { coverImage, ...rest } = result;
	return {
		...rest,
		coverImage: urlFor(coverImage),
		epigraphs: result.epigraphs.map((epigraph) => ({
			text: mapBlockContentToTextParagraphs(epigraph.text),
			reference: mapBlockContentToTextParagraphs(epigraph.reference),
		})),
		paragraphs: mapBlockContentToTextParagraphs(result.body),
		summary: mapBlockContentToTextParagraphs(result.review),
		author: mapAuthor(result.author),
		media: mapMediaSources(result.mediaSources),
		resources: mapResources(result.resources),
		tags: mapTags(result.tags),
	};
}

export function mapStoryTeaserWithAuthor(story: StoryTeaserWithAuthor): StoryTeaserWithAuthor {
	return {
		...story,
		paragraphs: story?.paragraphs ?? [],
		media: story.media ?? [],
		originalPublication: story.originalPublication ?? '',
	};
}

export type StoryTeasersQueryResult = NonNullable<StoriesByAuthorSlugQueryResult | StoriesBySlugsQueryResult>;
export function mapStoryTeaser(result: StoryTeasersQueryResult): StoryTeaser[] {
	const stories = [];

	for (const item of result) {
		const { mediaSources, resources, body, coverImage, ...properties } = item;

		stories.push({
			...properties,
			coverImage: urlFor(coverImage),
			media: mapMediaSources(mediaSources),
			resources: mapResources(resources),
			paragraphs: mapBlockContentToTextParagraphs(body) as [TextBlockContent, TextBlockContent, TextBlockContent],
			tags: [],
		});
	}

	return stories;
}

type MostReadStoriesSubQuery = NonNullable<RotatingContentQueryResult>['mostRead'];
export function mapStoryNavigationTeaserWithAuthor(
	result: NonNullable<MostReadStoriesSubQuery>,
): StoryNavigationTeaserWithAuthor[] {
	const stories = [];

	for (const item of result) {
		const { mediaSources, resources, coverImage, ...properties } = item;

		stories.push({
			...properties,
			author: mapAuthorTeaser(item.author),
			coverImage: urlFor(coverImage),
			media: mapMediaSources(mediaSources),
			resources: mapResources(resources),
			paragraphs: [],
			tags: [],
		});
	}

	return stories;
}

export function mapLandingPageContent(
	result: NonNullable<LandingPageContentQueryResult> & RotatingContent,
): LandingPageContent {
	return {
		_id: result._id,
		config: result.config,
		cards: mapStorylistTeasers(result.cards),
		campaigns: mapContentCampaigns(result.campaigns),
		mostRead: result.mostRead,
		latestReads: mapStoryNavigationTeaserWithAuthor(result.latestReads),
		highlightedAuthors: mapHighlightedAuthors(result.highlightedAuthors),
	};
}

type HighlightedAuthorsSubQuery = NonNullable<LandingPageContentQueryResult>['highlightedAuthors'];
export function mapHighlightedAuthors(highlightedAuthors: HighlightedAuthorsSubQuery): HighlightedAuthor[] {
	// El Studio limita la carga a seis entradas, pero esa regla gobierna la edición y no lo ya guardado:
	// una migración o un backfill pueden dejar más. El recorte acá es una salvaguarda, no la regla.
	const limit = 6;

	return highlightedAuthors.slice(0, limit).map((entry) => ({
		author: mapAuthorTeaser(entry.author),
		tags: dedupeTagsBySlug([...mapTags(entry.additionalTags), ...mapTags(entry.author.tags)]),
		storyCount: entry.storyCount,
	}));
}

// Las puntuales de la semana encabezan la lista, así que ante una repetida gana la primera aparición.
// Reconstruir con un `Map` no serviría: conservaría esa posición pero con el valor de la última, que
// es la derivada.
function dedupeTagsBySlug(tags: Tag[]): Tag[] {
	const seen = new Set<string>();

	return tags.filter((tag) => {
		if (seen.has(tag.slug)) {
			return false;
		}
		seen.add(tag.slug);
		return true;
	});
}

type ContentCampaignsSubQuery = NonNullable<LandingPageContentQueryResult>['campaigns'];
export function mapContentCampaigns(campaigns: ContentCampaignsSubQuery): ContentCampaign[] {
	return campaigns.map((campaign) => {
		const { xs, md } = campaign.contents;

		if (!xs || !md) {
			throw new Error('Campaign content not found');
		}

		return {
			title: campaign.title,
			slug: campaign.slug,
			url: campaign.url,
			contents: {
				xs: {
					imageUrl: xs.image ? urlForWithAutoFormat(xs.image) : '',
					imageWidth: viewportElementSizes.xs.imageWidth,
					imageHeight: viewportElementSizes.xs.imageHeight,
				},
				md: {
					imageUrl: md.image ? urlForWithAutoFormat(md.image) : '',
					imageWidth: viewportElementSizes.md.imageWidth,
					imageHeight: viewportElementSizes.md.imageHeight,
				},
			},
		};
	});
}
