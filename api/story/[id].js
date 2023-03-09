import { mapAuthor, mapBodyToParagraphs, mapPrologues } from '../functions';

const sanityConnector = require('../_helpers/sanity-connector');

export default async function getById(req, res) {
    const { id } = req.query;
    const query = `*[_type == 'story' && _id == '${id}']{title, day, originalLink, forewords, categories, publishedAt, body, review, forewords, author->}[0]`;
    const story = await sanityConnector.client.fetch(query, {});

    res.json({
        ...story,
        summary: story.review,
        paragraphs: mapBodyToParagraphs(story.body),
        author: mapAuthor(story.author),
        prologues: mapPrologues(story.forewords),
    });
}
