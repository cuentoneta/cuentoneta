// Conector a Sanity
import { client } from '../_helpers/sanity-connector';

// Funciones
import { mapMediaSources, mapMediaSourcesForStorylist } from './media-sources.functions';

// Tipos de Sanity
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

// Sanity utils
import imageUrlBuilder from '@sanity/image-url';

// Modelos
import { Author, AuthorTeaser } from '@models/author.model';
import { ContentCampaign, viewportElementSizes } from '@models/content-campaign.model';
import { LandingPageContent } from '@models/landing-page-content.model';
import {
	Publication,
	Storylist,
	StorylistPublicationsNavigationTeasers,
	StorylistTeaser,
} from '@models/storylist.model';
import { Resource } from '@models/resource.model';
import {
	Story,
	StoryNavigationTeaser,
	StoryNavigationTeaserWithAuthor,
	StoryPreview,
	StoryTeaser,
} from '@models/story.model';
import { Tag } from '@models/tag.model';
import { TextBlockContent } from '@models/block-content.model';

// Tipos de Sanity
import {
	AuthorBySlugQueryResult,
	AuthorsQueryResult,
	BlockContent,
	LandingPageContentQueryResult,
	StoriesByAuthorSlugQueryResult,
	StoriesBySlugsQueryResult,
	StoryBySlugQueryResult,
	StorylistNavigationTeasersQueryResult,
	StorylistQueryResult,
	StorylistTeasersQueryResult,
} from '../sanity/types';

// Unwrapper de tipos definidos en Array<...>
type UnwrapArray<A> = A extends unknown[] ? UnwrapArray<A[number]> : A;

export function mapAuthor(rawAuthorData: NonNullable<AuthorBySlugQueryResult>, language: 'es' | 'en' = 'es'): Author {
	const resources = mapResources(rawAuthorData.resources);
	const biography = mapAuthorBiography(rawAuthorData.biography, language);

	return {
		_id: rawAuthorData._id,
		slug: rawAuthorData.slug.current,
		nationality: {
			country: rawAuthorData.nationality?.country,
			flag: urlFor(rawAuthorData.nationality.flag),
		},
		resources: resources,
		imageUrl: urlFor(rawAuthorData.image),
		name: rawAuthorData.name,
		biography: biography,
	};
}
type AuthorTeaserForPublicationSubQuery = NonNullable<StorylistQueryResult>['publications'][0]['story']['author'];
type AuthorTeaserForListSubQuery = UnwrapArray<AuthorsQueryResult>;
export function mapAuthorTeaser(
	author: AuthorTeaserForPublicationSubQuery | AuthorTeaserForListSubQuery,
): AuthorTeaser {
	return {
		_id: author._id,
		slug: author.slug.current,
		nationality: {
			country: author.nationality?.country,
			flag: urlFor(author.nationality.flag),
		},
		imageUrl: urlFor(author.image),
		name: author.name,
		biography: [],
		resources: [],
	};
}

type BiographySubQuery = NonNullable<AuthorBySlugQueryResult>['biography'];
export function mapAuthorBiography(biography: BiographySubQuery, language: 'es' | 'en' = 'es'): TextBlockContent[] {
	if (Object.keys(biography).length === 0) {
		return [];
	}
	return mapBlockContentToTextParagraphs(biography[language] as BlockContent);
}

function urlFor(source: SanityImageSource): string {
	if (!source) {
		return '';
	}
	return imageUrlBuilder(client).image(source).url();
}

type ResourcesSubQuery = (
	| NonNullable<AuthorBySlugQueryResult>
	| NonNullable<StoryBySlugQueryResult>
	| NonNullable<StoryBySlugQueryResult>['author']
	| NonNullable<StorylistQueryResult>['publications'][0]['story']
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

type TagsSubQuery = (StorylistTeasersQueryResult[0] | NonNullable<StorylistTeasersQueryResult>[0])['tags'];
function mapTags(tags: TagsSubQuery): Tag[] {
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
		description: mapBlockContentToTextParagraphs(item.description),
		tags: mapTags(item.tags),
		featuredImage: urlFor(item.featuredImage),
	}));
}

export function mapStorylist(result: NonNullable<StorylistQueryResult>): Storylist {
	// Toma las publicaciones que fueron traídas en la consulta a Sanity y las mapea a una colección de publicaciones
	const publications: Publication[] = [];
	for (const publication of result.publications) {
		const { body, author, mediaSources, ...story } = publication.story;
		publications.push({
			...publication,
			story: mapStoryPreviewContent({
				...story,
				author: mapAuthorTeaser({ ...author }),
				media: mapMediaSourcesForStorylist(mediaSources),
				paragraphs: mapBlockContentToTextParagraphs(body),
				resources: [],
			}),
		});
	}

	return {
		...result,
		description: mapBlockContentToTextParagraphs(result.description),
		tags: mapTags(result.tags),
		featuredImage: urlFor(result.featuredImage),
		publications,
	};
}

export function mapStorylistNavigationTeasers(
	result: NonNullable<StorylistNavigationTeasersQueryResult>,
): StorylistPublicationsNavigationTeasers {
	return {
		...result,
		description: mapBlockContentToTextParagraphs(result.description),
		tags: mapTags(result.tags),
		featuredImage: urlFor(result.featuredImage),
		publications: result.publications.map((p) => ({
			...p,
			story: { ...p.story, author: mapAuthorTeaser(p.story.author), paragraphs: [], media: [] },
		})),
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
		author: mapAuthor(result.author, result.language),
		media: await mapMediaSources(result.mediaSources),
		resources: mapResources(result.resources),
	};
}

export function mapStoryPreviewContent(story: StoryPreview): StoryPreview {
	const card = {
		...story,
		paragraphs: story?.paragraphs ?? [],
		media: story.media ?? [],
		originalPublication: story.originalPublication ?? '',
	};

	if (story.author) {
		card.author = {
			...story.author,
		};
	}
	return card;
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

type MostReadStoriesSubQuery = NonNullable<LandingPageContentQueryResult>['mostRead'];
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

export function mapLandingPageContent(result: NonNullable<LandingPageContentQueryResult>): LandingPageContent {
	return {
		...result,
		cards: mapStorylistTeasers(result.cards),
		campaigns: mapContentCampaigns(result.campaigns),
		mostRead: mapStoryNavigationTeaserWithAuthor(result.mostRead),
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
					title: mapBlockContentToTextParagraphs(xs.title),
					subtitle: mapBlockContentToTextParagraphs(xs.subtitle),
					imageUrl: xs.image ? urlFor(xs.image) : '',
					imageWidth: viewportElementSizes.xs.imageWidth,
					imageHeight: viewportElementSizes.xs.imageHeight,
				},
				md: {
					title: mapBlockContentToTextParagraphs(md.title),
					subtitle: mapBlockContentToTextParagraphs(md.subtitle),
					imageUrl: md.image ? urlFor(md.image) : '',
					imageWidth: viewportElementSizes.md.imageWidth,
					imageHeight: viewportElementSizes.md.imageHeight,
				},
			},
		};
	});
}
