// Conector a Sanity
import { client } from '../_helpers/sanity-connector';

// Tipos de Sanity
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { ImageUrlBuilder } from '@sanity/image-url/lib/types/builder';

// Sanity utils
import imageUrlBuilder from '@sanity/image-url';
import { baseLanguage } from '../../../cms/utils/localization';

// Modelos
import { Author } from '@models/author.model';
import { mapMediaSourcesForStorylist } from './media-sources.functions';
import { Publication, StorylistDTO } from '@models/storylist.model';
import { Story, StoryPreview } from '@models/story.model';
import { Resource } from '@models/resource.model';
import { AuthorBySlugQueryResult, StorylistQueryResult } from '../sanity/types';
import { TextBlockContent } from '@models/block-content.model';

export function mapAuthor(rawAuthorData: AuthorBySlugQueryResult, language?: string): Author {
	return {
		slug: rawAuthorData.slug.current,
		nationality: {
			country: rawAuthorData.nationality?.country,
			flag: urlFor(rawAuthorData.nationality.flag)?.url(),
		},
		resources: rawAuthorData.resources ? mapResources(rawAuthorData.resources) : [],
		imageUrl: rawAuthorData.image ? urlFor(rawAuthorData.image).url() : '',
		name: rawAuthorData.name,
		biography: rawAuthorData.biography
			? (rawAuthorData.biography[language || baseLanguage.id] as TextBlockContent[])
			: [],
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

export async function mapStorylistTeaser(result: StorylistQueryResult): Promise<StorylistDTO> {
	return {
		...result,
		featuredImage: !result.featuredImage ? undefined : urlFor(result.featuredImage).url(),
		images: [],
		publications: [],
		gridConfig: {
			...result.gridConfig,
			cardsPlacement: [],
		},
	};
}

export function mapStorylist(result: StorylistQueryResult): StorylistDTO {
	// TODO: En otra issue habría que crear un tipo distinto para la propiedad publication
	// en GridItemPlacementConfig ya que al usar Publication<StoryPreview> el tipado espera
	// propiedades como resources, media y paragraphs que no pedimos en la query ni usamos.
	const cardsPlacement = result.gridConfig.cardsPlacement ?? [];
	const publicationCards =
		cardsPlacement
			.filter((gc) => gc.slug)
			.map((gc) => {
				return {
					...gc,
					// TODO: Remover propiedades hardcoded al descartar gridConfig
					startCol: 'auto',
					endCol: 'span 6',
					publication: {
						...gc.publication,
						story: {
							...gc.publication.story,
							resources: [],
							media: [],
							paragraphs: [],
							author: mapAuthor(gc.publication.story.author),
						},
					},
				};
			}) ?? [];

	const rawPublications = publicationCards
		.filter((cardPlacement) => !!cardPlacement.publication && !!cardPlacement.publication.story)
		.map((cardPlacement) => cardPlacement.publication);
	const publications: Publication<StoryPreview>[] = [];

	// Toma las publicaciones que fueron traídas en la consulta a Sanity y las mapea a una colección de publicaciones
	for (const publication of rawPublications) {
		const { body, author, mediaSources, ...story } = publication.story;
		publications.push({
			...publication,
			editionLabel: '',
			comingNextLabel: '',
			story: mapStoryPreviewContent({
				...story,
				media: mapMediaSourcesForStorylist(mediaSources),
				paragraphs: body as TextBlockContent[],
				author,
				resources: [],
			}),
		});
	}

	return {
		...result,
		featuredImage: !result.featuredImage ? undefined : urlFor(result.featuredImage).url(),
		images: [],
		publications,
		gridConfig: {
			...result.gridConfig,
			cardsPlacement: publicationCards,
		},
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
