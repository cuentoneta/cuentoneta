const imageUrlBuilder = require('@sanity/image-url');
const sanityConnector = require('./_helpers/sanity-connector');
const builder = imageUrlBuilder(sanityConnector.client);

module.exports = { mapAuthor, mapBodyToParagraphs, mapPrologues, urlFor };

function mapAuthor(authorDTO) {
    return {
        biography: authorDTO.bio,
        nationality: urlFor(authorDTO.country).url(),
        fullBioUrl: authorDTO.fullBioUrl,
        imageUrl: urlFor(authorDTO.image).url(),
        name: authorDTO.name,
    };
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
