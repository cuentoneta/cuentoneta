// Conector a Sanity
import { client } from '../_helpers/sanity-connector';

// Funciones
import { mapMediaSources, mapMediaSourcesTeasers } from './media-sources.functions';
import { mapImagery } from './storylist-imagery.functions';

// Tipos de Sanity

// Sanity utils
import { createImageUrlBuilder, SanityImageSource } from '@sanity/image-url';

// Modelos
import { Author, AuthorProfile, AuthorTeaser } from '@models/author.model';
import { ContentCampaign, viewportElementSizes } from '@models/content-campaign.model';
import { LandingPageContent, RotatingContent } from '@models/landing-page-content.model';
import { StorylistTeaser } from '@models/storylist.model';
import { Resource } from '@models/resource.model';
import {
	Story,
	StoryNavigationTeaser,
	StoryNavigationTeaserWithAuthor,
	StoryTeaser,
	StoryTeaserWithAuthor,
} from '@models/story.model';
import { Tag } from '@models/tag.model';
import { TextBlockContent } from '@models/block-content.model';

// Tipos de Sanity
import {
	AuthorBySlugQueryResult,
	AuthorsQueryResult,
	BlockContent,
	LandingPageContentQueryResult,
	RotatingContentQueryResult,
	StoriesByAuthorSlugQueryResult,
	StoriesBySlugsQueryResult,
	StoryBySlugQueryResult,
	StorylistQueryResult,
	StorylistTeasersQueryResult,
} from '../sanity/types';

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
	const biography = mapAuthorBiography(rawAuthorData.biography);

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
export function mapAuthorTeaser(
	rawAuthorData: AuthorTeaserForStoriesSubQuery | AuthorTeaserForListSubQuery,
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
		biography: [],
		bornOn: rawAuthorData.bornOn ? (rawAuthorData.bornOn as DateString) : undefined,
		diedOn: rawAuthorData.diedOn ? (rawAuthorData.diedOn as DateString) : undefined,
		bornOnYear: rawAuthorData.bornOnYear ?? undefined,
		diedOnYear: rawAuthorData.diedOnYear ?? undefined,
	};
}

type BiographySubQuery = NonNullable<AuthorBySlugQueryResult>['biography'];
export function mapAuthorBiography(biography: BiographySubQuery): TextBlockContent[] {
	if (!biography || biography.length === 0) {
		return [];
	}
	return mapBlockContentToTextParagraphs(biography);
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
	| StoriesByAuthorSlugQueryResult[0]
)['resources'];
export function mapResources(resources: ResourcesSubQuery): Resource[] {
	return (
		resources?.map((resource) => ({
			...resource,
			resourceType: {
				...resource.resourceType,
				description: mapBlockContentToTextParagraphs(resource.resourceType.description),
				icon: {
					provider: resource.resourceType.icon.provider ?? '',
					name: resource.resourceType.icon.name ?? '',
				},
			},
		})) ?? []
	);
}

type TagsSubQuery =
	| NonNullable<StoryBySlugQueryResult>['tags']
	| NonNullable<AuthorBySlugQueryResult>['tags']
	| NonNullable<StorylistTeasersQueryResult>[0]['tags'];
export function mapTags(tags: TagsSubQuery): Tag[] {
	return tags.map((tag) => ({
		...tag,
		description: mapBlockContentToTextParagraphs(tag.description),
		icon: {
			provider: tag.icon.provider ?? '',
			name: tag.icon.name ?? '',
		},
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
			media: mapMediaSourcesTeasers(mediaSources),
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
			media: mapMediaSourcesTeasers(mediaSources),
			resources: mapResources(resources),
			paragraphs: mapBlockContentToTextParagraphs(body) as [TextBlockContent, TextBlockContent, TextBlockContent],
		});
	}

	return stories;
}

export function mapStoryNavigationTeaser(result: NonNullable<StoriesByAuthorSlugQueryResult>): StoryNavigationTeaser[] {
	const stories = [];

	for (const item of result) {
		const { mediaSources, resources, coverImage, ...properties } = item;

		stories.push({
			...properties,
			coverImage: urlFor(coverImage),
			media: mapMediaSourcesTeasers(mediaSources),
			resources: mapResources(resources),
			paragraphs: [],
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
			media: mapMediaSourcesTeasers(mediaSources),
			resources: mapResources(resources),
			paragraphs: [],
		});
	}

	return stories;
}

export function mapLandingPageContent(
	result: NonNullable<LandingPageContentQueryResult> & RotatingContent,
): LandingPageContent {
	return {
		...result,
		cards: mapStorylistTeasers(result.cards),
		campaigns: mapContentCampaigns(result.campaigns),
		latestReads: mapStoryNavigationTeaserWithAuthor(result.latestReads),
	};
}

type ContentCampaignsSubQuery = NonNullable<LandingPageContentQueryResult>['campaigns'];
export function mapContentCampaigns(campaigns: ContentCampaignsSubQuery): ContentCampaign[] {
	return campaigns.map((campaign) => {
		const { xs, md } = campaign.contents;

		if (!xs || !md) {
			throw new Error('Campaign content not found');
		}

		return {
			...campaign,
			title: campaign.title,
			description: mapBlockContentToTextParagraphs(campaign.description),
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
