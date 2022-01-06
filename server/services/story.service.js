const sanityConnector = require('../_helpers/sanity-connector');
const imageUrlBuilder = require('@sanity/image-url');

const builder = imageUrlBuilder(sanityConnector.client);

function urlFor(source) {
    return builder.image(source);
}

module.exports = {
    getAuthors,
    getById,
};

async function getAuthors() {
    const query = `*[_type == 'story'] | order(day desc) {title, day, categories, publishedAt, author->}`;
    const authors = await sanityConnector.client.fetch(query, {});
    return authors.map((x) => ({ ...x, author: mapAuthor(x.author) }));
}

async function getById(id) {
    const query = `*[_type == 'story' && day == ${id}]{title, day, originalLink, forewords, categories, publishedAt, body, review, forewords, author->}`;
    const result = await sanityConnector.client.fetch(query, {});

    let story = result.length ? result.pop() : null;

    if (story) {
        story = {
            ...story,
            summary: story.review,
            paragraphs: mapBodyToParagraphs(story.body),
            author: mapAuthor(story.author),
            prologues: mapPrologues(story.forewords),
        };
    }

    return story;
}

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
    return prologuesDTO.map(x => ({reference: x.fwAuthor, text: x.fwText}));
}
