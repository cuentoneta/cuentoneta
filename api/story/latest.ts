import { mapAuthor, mapPrologues } from '../_utils/functions';
import { client } from '../_helpers/sanity-connector';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { StoryDAO } from '../_models/story-dao.model';

/**
 * Obtiene las últimas cinco historias almacenadas en Sanity
 * @param req
 * @param res
 * @returns {Promise<null>}
 */
export default async function get(req: VercelRequest, res: VercelResponse) {
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
                            approximateReadingTime,
                            'author': author-> { ..., nationality-> }
                        } | order(day desc)[0...${amount}]
                    }`;

    const result = await client.fetch(query, {});

    if (!result) {
        res.json(null);
    }

    const storylist = {
        ...result,
        stories: result.stories.map((story: StoryDAO) => ({
            ...story,
            id: story._id,
            summary: story.review,
            paragraphs: story.body,
            author: mapAuthor(story.author),
            prologues: mapPrologues(story.forewords),
        })),
    };

    res.json(storylist);
}
