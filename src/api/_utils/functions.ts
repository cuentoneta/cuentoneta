import { client } from '../_helpers/sanity-connector';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { AuthorDAO } from '../_models/author-dao.model';
import { ForewordDAO } from '../_models/story-dao.model';
import imageUrlBuilder from '@sanity/image-url';
import { baseLanguage } from '../../../cms/utils/localization';

export function mapAuthor(rawAuthorData: any, language?: string): AuthorDAO {
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

export function mapPrologues(prologuesDTO: ForewordDAO[]) {
  return prologuesDTO
    ? prologuesDTO.map((x) => ({ reference: x.fwAuthor, text: x.fwText }))
    : [];
}

export function urlFor(source: SanityImageSource) {
  return imageUrlBuilder(client).image(source);
}
