// Conector a Sanity
import { client } from '../_helpers/sanity-connector';

// Funciones
import { mapMediaSourcesForStorylist } from './media-sources.functions';

// Tipos de Sanity
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { ImageUrlBuilder } from '@sanity/image-url/lib/types/builder';
import {
	BiographySubQueryResult,
	ResourceSubQueryResult,
	SupportedLanguageCodes,
	TagsSubQueryResult,
} from '../sanity/derivate-types';
import {
	AuthorBySlugQueryResult,
	StorylistQueryResult,
	StorylistTeasersQueryResult,
} from '../sanity/generated-query-types';

// Sanity utils
import imageUrlBuilder from '@sanity/image-url';
import { baseLanguage } from '../../../cms/utils/localization';

// Modelos
import { Author } from '@models/author.model';
import { BlockContent } from '../sanity/generated-schema-types';
import { Resource } from '@models/resource.model';
import { Storylist, StorylistTeaser } from '@models/storylist.model';
import { Story, StoryPreview } from '@models/story.model';
import { Tag } from '@models/tag.model';
import { TextBlockContent } from '@models/block-content.model';

export function mapAuthor(
	rawAuthorData: Exclude<AuthorBySlugQueryResult, null>,
	language: SupportedLanguageCodes = baseLanguage.id,
): Author {
	const resources = mapResources(rawAuthorData.resources);
	const biography = mapAuthorBiography(rawAuthorData.biography, language);

	return {
		slug: rawAuthorData.slug.current,
		nationality: {
			country: rawAuthorData.nationality?.country,
			flag: urlFor(rawAuthorData.nationality.flag)?.url(),
		},
		resources: resources,
		imageUrl: urlFor(rawAuthorData.image).url(),
		name: rawAuthorData.name,
		biography: biography,
	};
}

export function mapAuthorBiography(
	biography: BiographySubQueryResult,
	language: SupportedLanguageCodes = baseLanguage.id,
): TextBlockContent[] {
	return mapBlockContentToTextParagraphs(biography[language] as BlockContent);
}

export function urlFor(source: SanityImageSource): ImageUrlBuilder {
	return imageUrlBuilder(client).image(source);
}

export function mapResources(resources: ResourceSubQueryResult): Resource[] {
	return (
		resources?.map((resource) => ({
			...resource,
			resourceType: {
				...resource.resourceType,
				icon: {
					provider: resource.resourceType.icon.provider ?? '',
					name: resource.resourceType.icon.name ?? '',
					svg: resource.resourceType.icon ? `data:image/svg+xml,${resource.resourceType.icon.svg}` : '',
				},
			},
		})) ?? []
	);
}

export function mapTags(tags: TagsSubQueryResult): Tag[] {
	return tags.map((tag) => ({
		...tag,
		icon: {
			provider: tag.icon.provider ?? '',
			name: tag.icon.name ?? '',
			svg: tag.icon ? `data:image/svg+xml,${tag.icon.svg}` : '',
		},
	}));
}

export function mapStorylistTeasers(result: StorylistTeasersQueryResult): StorylistTeaser[] {
	return result.map((item) => ({
		...item,
		description: mapBlockContentToTextParagraphs(item.description),
		tags: mapTags(item.tags),
		featuredImage: urlFor(item.featuredImage).url(),
	}));
}

export function mapStorylist(result: Exclude<StorylistQueryResult, null>): Storylist {
	// Toma las publicaciones que fueron traídas en la consulta a Sanity y las mapea a una colección de publicaciones
	const publications = [];
	for (const publication of result.publications) {
		const { body, author, mediaSources, ...story } = publication.story;
		publications.push({
			...publication,
			story: mapStoryPreviewContent({
				...story,
				author: mapAuthor({ ...author, biography: {}, resources: [] }),
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
		featuredImage: urlFor(result.featuredImage).url(),
		publications,
	};
}

// TODO: Agregar soporte a futuro para mapear imágenes de los recursos multimedia
export function mapBlockContentToTextParagraphs(content: BlockContent): TextBlockContent[] {
	return content.filter((element) => element._type === 'block') as TextBlockContent[];
}

export function mapStoryContent(story: Story): Story {
	return {
		...story,
		epigraphs: story.epigraphs ?? [],
		paragraphs: story?.paragraphs ?? [],
		summary: story?.summary ?? [],
		author: {
			...story.author,
			biography: story.author.biography ?? [],
		},
		media: story.media ?? [],
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
