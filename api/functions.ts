import { client } from './_helpers/sanity-connector';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { AuthorDAO } from './_models/author-dao.model';
import { ForewordDAO } from './_models/story-dao.model';
import imageUrlBuilder from '@sanity/image-url';

export function mapAuthor(authorDAO: AuthorDAO) {
    const result = {
        id: authorDAO._id,
        biography: authorDAO.bio,
        nationality: authorDAO.nationality,
        fullBioUrl: authorDAO.fullBioUrl,
        imageUrl: urlFor(authorDAO.image).url(),
        name: authorDAO.name,
    };

    if (authorDAO.nationality?.country && authorDAO.nationality?.flag) {
        result.nationality = {
            country: authorDAO.nationality?.country,
            flag: urlFor(authorDAO.nationality?.flag)?.url(),
        };
    }

    return result;
}

export function mapPrologues(prologuesDTO: ForewordDAO[]) {
    return prologuesDTO ? prologuesDTO.map((x) => ({ reference: x.fwAuthor, text: x.fwText })) : [];
}

export function urlFor(source: SanityImageSource) {
    return imageUrlBuilder(client).image(source);
}
