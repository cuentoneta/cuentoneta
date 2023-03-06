const imageUrlBuilder = require('@sanity/image-url');
const sanityConnector = require('./_helpers/sanity-connector');
const builder = imageUrlBuilder(sanityConnector.client);

module.exports = { mapAuthor, mapBodyToParagraphs, mapPrologues, urlFor };

function mapAuthor(authorDTO) {
    const obj = {
        id: authorDTO._id,
        biography: authorDTO.bio,
        nationality: authorDTO.nationality,
        fullBioUrl: authorDTO.fullBioUrl,
        imageUrl: urlFor(authorDTO.image).url(),
        name: authorDTO.name,
    };

    if (authorDTO.nationality?.country && authorDTO.nationality?.flag) {
        obj.nationality = { country: authorDTO.nationality?.country, flag: urlFor(authorDTO.nationality?.flag)?.url() };
    }

    return obj;
}

function mapBodyToParagraphs(story) {
    return story;
}

function mapPrologues(prologuesDTO) {
    return prologuesDTO ? prologuesDTO.map((x) => ({ reference: x.fwAuthor, text: x.fwText })) : [];
}

function urlFor(source) {
    return builder.image(source);
}
