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
import { StorylistDTO } from '@models/storylist.model';

export function mapAuthor(rawAuthorData: any, language?: string): AuthorDTO {
	return {
		slug: rawAuthorData.slug.current,
		nationality: {
			country: rawAuthorData.nationality?.country,
			flag: urlFor(rawAuthorData.nationality?.flag)?.url(),
		},
		resources: mapResources(rawAuthorData.resources),
		imageUrl: rawAuthorData.image ? urlFor(rawAuthorData.image).url() : '',
		name: rawAuthorData.name,
		biography: rawAuthorData.biography ? rawAuthorData.biography[language || baseLanguage!.id] : undefined,
	};
}

export function mapAuthorForStory(rawAuthorData: any, language?: string): AuthorDTO {
	return {
		slug: rawAuthorData.slug.current,
		nationality: {
			country: rawAuthorData.nationality?.country,
			flag: urlFor(rawAuthorData.nationality?.flag)?.url(),
		},
		resources: mapResources(rawAuthorData.resources),
		imageUrl: rawAuthorData.image ? urlFor(rawAuthorData.image).url() : '',
		name: rawAuthorData.name,
		biography: rawAuthorData.biography ? rawAuthorData.biography[language || baseLanguage!.id] : undefined,
	};
}

export function urlFor(source: SanityImageSource): ImageUrlBuilder {
	return imageUrlBuilder(client).image(source);
}

export function mapResources(resources: any[]) {
	return (
		resources?.map((resource: any) => ({
			...resource,
			resourceType: {
				...resource.resourceType,
				icon: {
					...resource.resourceType.icon,
					svg: `data:image/svg+xml,${resource.resourceType.icon.svg}`,
				},
			},
		})) ?? []
	);
}

export async function mapStorylist(result: any): Promise<StorylistDTO> {
	const cardsPlacement = result.gridConfig?.cardsPlacement ?? [];
	const storylistImages = cardsPlacement.filter((config: any) => !!config.imageSlug) ?? [];

	const rawPublications = cardsPlacement
		.filter((cardPlacement: any) => !!cardPlacement.publication && !!cardPlacement.publication.story)
		.map((cardPlacement: any) => cardPlacement.publication);
	const publications = [];

	// Toma las publicaciones que fueron traídas en la consulta a Sanity y las mapea a una colección de publicaciones
	for (const publication of rawPublications) {
		const { review, body, author, mediaSources, ...story } = publication.story;
		publications.push({
			...publication,
			story: {
				...story,
				media: mediaSources ? await mapMediaSources(mediaSources) : undefined,
				summary: review,
				paragraphs: body,
				author: mapAuthorForStory(author),
			},
		});
	}

	return {
		...result,
		featuredImage: !result.featuredImage ? undefined : urlFor(result.featuredImage).url(),
		images:
			storylistImages.length === 0
				? []
				: storylistImages.map((card: any) => ({
						slug: card.imageSlug,
						url: urlFor(card.image).url(),
					})),
		publications: publications,
	};
}
