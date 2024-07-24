// Conector a Sanity
import { client } from '../_helpers/sanity-connector';

// Tipos de Sanity
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { ImageUrlBuilder } from '@sanity/image-url/lib/types/builder';

// Sanity utils
import imageUrlBuilder from '@sanity/image-url';
import { baseLanguage } from '../../../cms/utils/localization';

// Modelos
import { AuthorDTO } from '@models/author.model';
import { mapMediaSources } from './media-sources.functions';
import { GridItemPlacementConfig, StorylistDTO } from '@models/storylist.model';
import { Story, StoryPreview } from '@models/story.model';
import { Resource } from '@models/resource.model';
import { AuthorBySlugQueryResult } from '../sanity/types';
import { TextBlockContent } from '@models/block-content.model';

export function mapAuthor(rawAuthorData: AuthorBySlugQueryResult, language?: string): AuthorDTO {
	return {
		slug: rawAuthorData.slug.current,
		nationality: {
			country: rawAuthorData.nationality?.country,
			flag: urlFor(rawAuthorData.nationality.flag)?.url(),
		},
		resources: mapResources(rawAuthorData.resources),
		imageUrl: rawAuthorData.image ? urlFor(rawAuthorData.image).url() : '',
		name: rawAuthorData.name,
		biography: rawAuthorData.biography
			? (rawAuthorData.biography[language || baseLanguage.id] as TextBlockContent[])
			: undefined,
	};
}

export function urlFor(source: SanityImageSource): ImageUrlBuilder {
	return imageUrlBuilder(client).image(source);
}

export function mapResources(resources: Resource[]) {
	return (
		resources?.map((resource: Resource) => ({
			...resource,
			resourceType: {
				...resource.resourceType,
				icon: resource.resourceType.icon
					? {
							...resource.resourceType.icon,
							svg: resource.resourceType.icon ? `data:image/svg+xml,${resource.resourceType.icon.svg}` : '',
						}
					: undefined,
			},
		})) ?? []
	);
}

export async function mapStorylist(result: any): Promise<StorylistDTO> {
	const cardsPlacement = result.gridConfig?.cardsPlacement ?? [];
	const storylistImages = cardsPlacement.filter((config: GridItemPlacementConfig) => !!config.imageSlug) ?? [];

	const rawPublications = cardsPlacement
		.filter(
			(cardPlacement: GridItemPlacementConfig) => !!cardPlacement.publication && !!cardPlacement.publication.story,
		)
		.map((cardPlacement: GridItemPlacementConfig) => cardPlacement.publication);
	const publications = [];

	// Toma las publicaciones que fueron traídas en la consulta a Sanity y las mapea a una colección de publicaciones
	for (const publication of rawPublications) {
		const { review, body, author, mediaSources, ...story } = publication.story;
		publications.push({
			...publication,
			story: mapStoryPreviewContent({
				...story,
				media: mediaSources ? await mapMediaSources(mediaSources) : undefined,
				summary: review,
				paragraphs: body,
				author: mapAuthor(author),
			}),
		});
	}

	return {
		...result,
		featuredImage: !result.featuredImage ? undefined : urlFor(result.featuredImage).url(),
		images:
			storylistImages.length === 0
				? []
				: storylistImages.map((card: GridItemPlacementConfig) => ({
						slug: card.imageSlug,
						url: urlFor(card.image).url(),
					})),
		publications: publications,
	};
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
