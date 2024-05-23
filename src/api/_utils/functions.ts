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

export function mapAuthor(rawAuthorData: any, language?: string): AuthorDTO {
	return {
		slug: rawAuthorData.slug.current,
		nationality: {
			country: rawAuthorData.nationality?.country,
			flag: urlFor(rawAuthorData.nationality?.flag)?.url(),
		},
		resources: mapResources(rawAuthorData.resources),
		imageUrl: rawAuthorData.image ? urlFor(rawAuthorData.image).url() : undefined,
		name: rawAuthorData.name,
		biography: rawAuthorData.biography,
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
		imageUrl: rawAuthorData.image ? urlFor(rawAuthorData.image).url() : undefined,
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

export async function mapStorylist(result: any) {
	const storylistImages = result.gridConfig.cardsPlacement?.filter((config: any) => !!config.imageSlug) ?? [];

	const rawPublications = result.gridConfig.cardsPlacement
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

export function mapStorylistPreview(result: any) {
	const previewImages = result.gridConfig?.cardsPlacement?.filter((config: any) => !!config.imageSlug) ?? [];
	return {
		...result,
		// Elimina elementos publication traídos en la consulta a Sanity del objeto grid config
		gridConfig: {
			...result.gridConfig,
			cardsPlacement: result.gridConfig.cardsPlacement?.map((placement: any) => {
				const { publication, image, ...other } = placement;
				return other;
			}),
		},
		featuredImage: !result.featuredImage ? undefined : urlFor(result.featuredImage).url(),
		images:
			previewImages.length === 0
				? []
				: previewImages.map((card: any) => ({
						slug: card.imageSlug,
						url: urlFor(card.image).url(),
					})),

		// Toma las publicaciones que fueron traídas en la consulta a Sanity y las mapea a una colección de publicaciones
		publications: result.gridConfig.cardsPlacement
			.filter((cardPlacement: any) => !!cardPlacement.publication && !!cardPlacement.publication.story)
			.map((cardPlacement: any) => cardPlacement.publication)
			.map((publication: any) => {
				const { review, body, author, ...story } = publication.story;
				return {
					...publication,
					story: {
						...story,
						summary: review,
						paragraphs: body,
						author: mapAuthorForStory(author),
					},
				};
			}),
	};
}
