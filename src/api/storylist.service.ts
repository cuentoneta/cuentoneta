import express from 'express';
import { client } from './_helpers/sanity-connector';
import { mapAuthor, mapPrologues, urlFor } from './_utils/functions';

async function fetchPreview(req: express.Request, res: express.Response) {
  const { slug } = req.query;

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
                                    'publication': *[ _type == 'publication' && storylist._ref == ^.^._id && story->slug.current == ^.publication->story->slug.current][0]{
                                        order,
                                        publishingDate,
                                        published,
                                        'story': story->{
                                            _id,
                                            'slug': slug.current,
                                            title,
                                            originalLink,
                                            videoUrl,
                                            forewords,
                                            categories,
                                            body[0...3],
                                            review,
                                            forewords,
                                            approximateReadingTime,
                                            'author': author-> { name, image, nationality-> }
                                        }
                                }
                            }
                        },
                        'count': count(*[ _type == 'publication' && storylist._ref == ^._id ])
                    }`;

  const result = await client.fetch(query, {});

  if (!result) {
    res.json(null);
  }

  const previewImages =
    result.gridConfig.cardsPlacement?.filter(
      (config: any) => !!config.imageSlug
    ) ?? [];

  const storylist = {
    ...result,
    // Elimina elementos publication traídos en la consulta a Sanity del objeto grid config
    gridConfig: {
      ...result.gridConfig,
      cardsPlacement: result.gridConfig.cardsPlacement.map(
        (placement: any) => {
          const { publication, image, ...other } = placement;
          return other;
        }
      ),
    },
    featuredImage: !result.featuredImage
      ? undefined
      : urlFor(result.featuredImage).url(),
    images:
      previewImages.length === 0
        ? []
        : previewImages.map((card: any) => ({
            slug: card.imageSlug,
            url: urlFor(card.image).url(),
          })),

    // Toma las publicaciones que fueron traídas en la consulta a Sanity y las mapea a una colección de publicaciones
    publications: result.gridConfig.cardsPlacement
      .filter((cardPlacement: any) => !!cardPlacement.publication)
      .map((cardPlacement: any) => cardPlacement.publication)
      .map((publication: any) => {
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
async function fetchStorylist(req: any, res: any) {
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
                                'publication': *[ _type == 'publication' && storylist._ref == ^.^._id && story->slug.current == ^.publication->story->slug.current][0]{
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
                                }
                          }
                        },
                        'count': count(*[ _type == 'publication' && storylist._ref == ^._id ])
                    }`;

  const result = await client.fetch(query, {});

  if (!result) {
    res.json(null);
  }

  const storylistImages =
    result.gridConfig.cardsPlacement?.filter(
      (config: any) => !!config.imageSlug
    ) ?? [];

  const storylist = {
    ...result,
    featuredImage: !result.featuredImage
      ? undefined
      : urlFor(result.featuredImage).url(),
    images:
      storylistImages.length === 0
        ? []
        : storylistImages.map((card: any) => ({
            slug: card.imageSlug,
            url: urlFor(card.image).url(),
          })),
    // Toma las publicaciones que fueron traídas en la consulta a Sanity y las mapea a una colección de publicaciones
    publications: result.gridConfig.cardsPlacement
        .filter((cardPlacement: any) => !!cardPlacement.publication)
        .map((cardPlacement: any) => cardPlacement.publication)
        .map((publication: any) => {
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

export { fetchPreview, fetchStorylist };
