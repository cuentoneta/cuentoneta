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
import { PrologueDTO } from '@models/prologue.model';

export function mapAuthor(rawAuthorData: any, language?: string): AuthorDTO {
	return {
		id: rawAuthorData._id,
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

export function mapPrologues(rawProloguesData: any): PrologueDTO[] {
	return rawProloguesData
		? rawProloguesData.map((x: { fwAuthor: any; fwText: any }) => ({
				reference: x.fwAuthor,
				text: x.fwText,
			}))
		: [];
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
