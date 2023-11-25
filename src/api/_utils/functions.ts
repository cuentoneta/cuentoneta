import { client } from '../_helpers/sanity-connector';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import imageUrlBuilder from '@sanity/image-url';
import { baseLanguage } from '../../../cms/utils/localization';
import { ImageUrlBuilder } from '@sanity/image-url/lib/types/builder';

// Modelos
import { AuthorDTO } from '../_models/author-dto';
import { PrologueDTO } from '@models/prologue.model';

export function mapAuthor(rawAuthorData: any, language?: string): AuthorDTO {
  return {
    id: rawAuthorData._id,
    nationality: {
      country: rawAuthorData.nationality?.country,
      flag: urlFor(rawAuthorData.nationality?.flag)?.url(),
    },
    fullBioUrl: rawAuthorData.fullBioUrl,
    imageUrl: urlFor(rawAuthorData.image).url(),
    name: rawAuthorData.name,
    biography: rawAuthorData.biography
      ? rawAuthorData.biography[language || baseLanguage!.id]
      : undefined,
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
