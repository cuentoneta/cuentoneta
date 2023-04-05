import { mapAuthor, mapPrologues } from '../_utils/functions';
import { client } from '../_helpers/sanity-connector';
import { VercelRequest, VercelResponse } from '@vercel/node';

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
                        'count': count(*[ _type == 'publication' && storylist._ref == ^._id ]),
                        'publications': *[ _type == 'publication' && storylist._ref == ^._id ] | order(order desc){
                            order,
                            publishingDate,
                            published,
                            'story': story->{
                                _id,
                                'slug': slug.current,
                                title,
                                originalLink,
                                forewords,
                                categories,
                                publishedAt,
                                body[0...2],
                                review,
                                forewords,
                                approximateReadingTime,
                                'author': author-> { name, image, nationality-> }
                            }
                        }[0..${amount}]
                    }`;

    const result = await client.fetch(query, {});

    if (!result) {
        res.json(null);
    }

    const storylist = {
        ...result,
        publications: result.publications.map((publication: any) => ({
            ...publication,
            story: {
                ...publication.story,
                summary: publication.story.review,
                paragraphs: publication.story.body,
                author: mapAuthor(publication.story.author),
                prologues: mapPrologues(publication.story.forewords),
            },
        })),
    };

    res.json(storylist);
}
