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
import { BlockContent, StorylistTeasersQueryResult } from '../sanity/types';
import { Resource } from '@models/resource.model';
import { Publication, Storylist, StorylistTeaser } from '@models/storylist.model';
import { Story, StoryPreview, StoryTeaser } from '@models/story.model';
import { TextBlockContent } from '@models/block-content.model';
import { Tag } from '@models/tag.model';

// Tipos de Sanity
import {
	AuthorBySlugQueryResult,
	StoriesByAuthorSlugQueryResult,
	StoryBySlugQueryResult,
	StorylistQueryResult,
} from '../sanity/types';

export function mapAuthor(rawAuthorData: NonNullable<AuthorBySlugQueryResult>, language: 'es' | 'en' = 'es'): Author {
	const resources = mapResources(rawAuthorData.resources);
	const biography = mapAuthorBiography(rawAuthorData.biography, language);

	return {
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

type PublicationAuthorSubQuery = NonNullable<StorylistQueryResult>['publications'][0]['story']['author'];
export function mapAuthorForStorylist(author: PublicationAuthorSubQuery): AuthorTeaser {
	return {
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
function mapResources(resources: ResourcesSubQuery): Resource[] {
	return (
		resources?.map((resource) => ({
			...resource,
			resourceType: {
				...resource.resourceType,
				description: mapBlockContentToTextParagraphs(resource.resourceType.description),
				icon: {
					provider: resource.resourceType.icon.provider ?? '',
					name: resource.resourceType.icon.name ?? '',
					svg: resource.resourceType.icon ? `data:image/svg+xml,${resource.resourceType.icon.svg}` : '',
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
			svg: tag.icon ? `${tag.icon.svg}` : '',
		},
	}));
}

export function mapStorylistTeasers(result: StorylistTeasersQueryResult): StorylistTeaser[] {
	return result.map((item) => ({
		...item,
		description: mapBlockContentToTextParagraphs(item.description),
		tags: mapTags(item.tags),
		featuredImage: urlFor(item.featuredImage),
		publications: [],
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
				author: mapAuthorForStorylist({ ...author }),
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

export function mapStoryTeaser(result: NonNullable<StoriesByAuthorSlugQueryResult>): StoryTeaser[] {
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
