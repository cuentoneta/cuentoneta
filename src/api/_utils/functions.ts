// Conector a Sanity
import { client } from '../_helpers/sanity-connector';

// Funciones
import { mapMediaSources, mapMediaSourcesForStorylist } from './media-sources.functions';

// Tipos de Sanity

// Sanity utils
import { createImageUrlBuilder, SanityImageSource } from '@sanity/image-url';

// Modelos
import { Author, AuthorTeaser } from '@models/author.model';
import { ContentCampaign, viewportElementSizes } from '@models/content-campaign.model';
import { LandingPageContent, RotatingContent } from '@models/landing-page-content.model';
import { Storylist, StorylistTeaser } from '@models/storylist.model';
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
	StorylistNavigationTeasersQueryResult,
	StorylistQueryResult,
	StorylistTeasersQueryResult,
} from '../sanity/types';

// Tipos de datos
import { DateString } from '@utils/date.utils';

// Unwrapper de tipos definidos en Array<...>
type UnwrapArray<A> = A extends unknown[] ? UnwrapArray<A[number]> : A;

export function mapAuthor(rawAuthorData: NonNullable<AuthorBySlugQueryResult>): Author {
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
		imageUrl: urlFor(rawAuthorData.image),
		name: rawAuthorData.name,
		biography: biography,
		bornOn: rawAuthorData.bornOn ? (rawAuthorData.bornOn as DateString) : undefined,
		diedOn: rawAuthorData.diedOn ? (rawAuthorData.diedOn as DateString) : undefined,
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
		imageUrl: urlFor(rawAuthorData.image),
		name: rawAuthorData.name,
		biography: [],
		bornOn: rawAuthorData.bornOn ? (rawAuthorData.bornOn as DateString) : undefined,
		diedOn: rawAuthorData.diedOn ? (rawAuthorData.diedOn as DateString) : undefined,
		resources: [],
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
		return '';
	}
	return createImageUrlBuilder(client).image(source).url();
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

type TagsSubQuery = NonNullable<StorylistTeasersQueryResult>[0]['tags'];
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

export function mapStorylistTeasers(result: StorylistTeasersQueryResult): StorylistTeaser[] {
	return result.map((item) => ({
		...item,
		config: {
			...item.config,
			showAuthors: item.config?.showAuthors ?? false,
		},
		description: mapBlockContentToTextParagraphs(item.description),
		tags: mapTags(item.tags),
		featuredImage: urlFor(item.featuredImage),
	}));
}

export function mapStorylist(result: NonNullable<StorylistQueryResult>): Storylist {
	// Toma las publicaciones que fueron traídas en la consulta a Sanity y las mapea a una colección de publicaciones
	const stories: StoryTeaserWithAuthor[] = [];
	for (const story of result.stories) {
		stories.push(
			mapStoryTeaserWithAuthor({
				...story,
				author: mapAuthorTeaser({ ...story.author }),
				media: mapMediaSourcesForStorylist(story.mediaSources),
				paragraphs: mapBlockContentToTextParagraphs(story.body),
				resources: [],
			}),
		);
	}

	return {
		...result,
		config: {
			...result.config,
			showAuthors: result.config?.showAuthors ?? false,
		},
		description: mapBlockContentToTextParagraphs(result.description),
		tags: mapTags(result.tags),
		featuredImage: urlFor(result.featuredImage),
		stories,
	};
}

// TODO: Agregar soporte a futuro para mapear imágenes dentro del cuerpo de una story
export function mapBlockContentToTextParagraphs(content: BlockContent): TextBlockContent[] {
	return content.filter((element) => element._type === 'block') as TextBlockContent[];
}

export async function mapStoryContent(result: NonNullable<StoryBySlugQueryResult>): Promise<Story> {
	return {
		...result,
		epigraphs: result.epigraphs.map((epigraph) => ({
			text: mapBlockContentToTextParagraphs(epigraph.text),
			reference: mapBlockContentToTextParagraphs(epigraph.reference),
		})),
		paragraphs: mapBlockContentToTextParagraphs(result.body),
		summary: mapBlockContentToTextParagraphs(result.review),
		author: mapAuthor(result.author),
		media: await mapMediaSources(result.mediaSources),
		resources: mapResources(result.resources),
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
		const { mediaSources, resources, body, ...properties } = item;

		stories.push({
			...properties,
			media: mapMediaSourcesForStorylist(mediaSources),
			resources: mapResources(resources),
			paragraphs: mapBlockContentToTextParagraphs(body) as [TextBlockContent, TextBlockContent, TextBlockContent],
		});
	}

	return stories;
}

export function mapStoryNavigationTeaser(result: NonNullable<StoriesByAuthorSlugQueryResult>): StoryNavigationTeaser[] {
	const stories = [];

	for (const item of result) {
		const { mediaSources, resources, ...properties } = item;

		stories.push({
			...properties,
			media: mapMediaSourcesForStorylist(mediaSources),
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
		const { mediaSources, resources, ...properties } = item;

		stories.push({
			...properties,
			author: mapAuthorTeaser(item.author),
			media: mapMediaSourcesForStorylist(mediaSources),
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
					imageUrl: xs.image ? urlFor(xs.image) : '',
					imageWidth: viewportElementSizes.xs.imageWidth,
					imageHeight: viewportElementSizes.xs.imageHeight,
				},
				md: {
					imageUrl: md.image ? urlFor(md.image) : '',
					imageWidth: viewportElementSizes.md.imageWidth,
					imageHeight: viewportElementSizes.md.imageHeight,
				},
			},
		};
	});
}
