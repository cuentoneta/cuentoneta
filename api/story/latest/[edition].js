import { mapAuthor, mapBodyToParagraphs, mapPrologues } from '../../functions';

const sanityConnector = require('../../_helpers/sanity-connector');

/**
 * Obtiene las últimas cinco historias almacenadas en Sanity
 * @param req
 * @param res
 * @returns {Promise<null>}
 */
export default async function getLatest(req, res) {
    const { edition } = req.query;
    const query = `*[_type == 'story' && edition == '${edition}'] | order(day desc)[0...5]{title, day, originalLink, forewords, categories, publishedAt, body, review, forewords, author->}`;
    const result = await sanityConnector.client.fetch(query, {});

    if (!result) {
        return null;
    }

    let stories = result.map((story) => ({
        ...story,
        summary: story.review,
        paragraphs: mapBodyToParagraphs(story.body),
        author: mapAuthor(story.author),
        prologues: mapPrologues(story.forewords),
    }));

    res.json(stories);
}