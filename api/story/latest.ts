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
  const { slug, amount, ordering = 'asc' } = req.query;
  const limit = parseInt(amount as string) - 1;

  const query = `*[_type == 'storylist' && slug.current == '${slug}'][0]
                    { 
                        _id,
                        'slug': slug.current,
                        title,
                        description,
                        language,
                        displayDates,
                        editionPrefix,
                        comingNextLabel,
                        'count': count(*[ _type == 'publication' && storylist._ref == ^._id ]),
                        'publications': *[ _type == 'publication' && storylist._ref == ^._id ] | order(order ${ordering}){
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
                                body[0...2],
                                review,
                                forewords,
                                approximateReadingTime,
                                'author': author-> { name, image, nationality-> }
                            }
                        }[0..${limit}]
                    }`;

  const result = await client.fetch(query, {});

  if (!result) {
    res.json(null);
  }

  const storylist = {
    ...result,
    publications: result.publications.map((publication: any) => {
      const { review, body, forewords, author, ...story } = publication.story;
      return {
        ...publication,
        story: {
          ...story,
          summary: review,
          paragraphs: body,
          author: mapAuthor(author),
          prologues: mapPrologues(forewords),
        },
      };
    }),
  };

  res.json(storylist);
}
