import { mapAuthor, mapPrologues, urlFor } from '../_utils/functions';
import { client } from '../_helpers/sanity-connector';
import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Obtiene las N historias correspondientes a una Storylist, según el orden pasado como parámetro.
 * slug -> Slug de la storylist
 * amount -> Cantidad de historias retornadas en la propiedad publications
 * ordering -> Orden en el que se retornarán las stories dentro de la propiedad publications. Default: orden ascendente.
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
                        featuredImage,
                        'gridConfig': { 
                          'gridTemplateColumns': gridConfig.gridTemplateColumns,
                          'titlePlacement': gridConfig.titlePlacement,
                          'cardsPlacement': gridConfig.cardsPlacement[]
                          {
                              'order': order,
                              'slug': @.publication->story->slug.current,
                              'startCol': startCol,
                              'image': image,
                              'imageSlug': imageSlug.current,
                              'endCol': endCol,
                              'startRow': startRow,
                              'endRow': endRow,
                          }
                        },
                        'previewGridConfig': { 
                          'gridTemplateColumns': previewGridConfig.gridTemplateColumns,
                          'titlePlacement': previewGridConfig.titlePlacement,
                          'cardsPlacement': previewGridConfig.cardsPlacement[]
                          {
                              'order': order,
                              'slug': @.publication->story->slug.current,
                              'startCol': startCol,
                              'image': image,
                              'imageSlug': imageSlug.current,
                              'endCol': endCol,
                              'startRow': startRow,
                              'endRow': endRow,
                          }
                        },
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
                                body[0...3],
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

  const previewImages =
    result.previewGridConfig.cardsPlacement?.filter((config) => !!config.imageSlug) ??
    [];

  const storyListImages =
    result.gridConfig.cardsPlacement?.filter((config) => !!config.imageSlug) ??
    [];

  const storylist = {
    ...result,
    featuredImage: !result.featuredImage
      ? undefined
      : urlFor(result.featuredImage).url(),
    images:
      storyListImages.length === 0
        ? []
        : storyListImages.map((card) => ({
            slug: card.imageSlug,
            url: urlFor(card.image).url(),
          })),
    previewImages:
        previewImages.length === 0
        ? []
        : previewImages.map((card) => ({
            slug: card.imageSlug,
            url: urlFor(card.image).url(),
          })),
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
