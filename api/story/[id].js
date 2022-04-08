import { mapAuthor, mapBodyToParagraphs, mapPrologues } from '../functions';

const sanityConnector = require('../_helpers/sanity-connector');

export default async function getById(req, res) {
    console.error(req.query);
    const { id } = req.query;
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

    res.json(story);
}
