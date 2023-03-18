import { mapAuthor, mapBodyToParagraphs, mapPrologues } from '../functions';

const sanityConnector = require('../_helpers/sanity-connector');

/**
 * Obtiene las últimas cinco historias almacenadas en Sanity
 * @param req
 * @param res
 * @returns {Promise<null>}
 */
export default async function getLatest(req, res) {
    const { slug, amount } = req.query;
    const query = `*[_type == 'storylist' && slug.current == '${slug}'][0]
                    { 
                        _id,
                        'slug': slug.current,
                        title,
                        description,
                        language,
                        editionPrefix,
                        'stories': stories[]->{
                            _id,
                            'slug': slug.current,
                            title,
                            day,
                            originalLink,
                            forewords,
                            categories,
                            publishedAt,
                            body[0...2],
                            review,
                            forewords,
                            'author': author-> { ..., nationality-> }
                        } | order(day desc)[0...${amount}]
                    }`;

    const result = await sanityConnector.client.fetch(query, {});

    if (!result) {
        return null;
    }

    let storylist = {
        ...result,
        stories: result.stories.map((story) => ({
            ...story,
            id: story._id,
            summary: story.review,
            paragraphs: mapBodyToParagraphs(story.body),
            author: mapAuthor(story.author),
            prologues: mapPrologues(story.forewords),
        })),
    };

    res.json(storylist);
}
