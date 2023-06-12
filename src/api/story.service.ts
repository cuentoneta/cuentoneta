import { client } from './_helpers/sanity-connector';
import { mapAuthor, mapPrologues, urlFor } from './_utils/functions';

async function fetchForRead(req: any, res: any) {
  {
    const { slug } = req.query;
    const query = `*[_type == 'story' && slug.current == '${slug}']
                          {
                              'slug':slug.current,
                              title, 
                              originalLink, 
                              forewords, 
                              categories, 
                              body, 
                              review, 
                              forewords, 
                              approximateReadingTime,
                              'author': author-> { ..., nationality-> }
                          }[0]`;
    const story = await client.fetch(query, {});

    res.json({
      ...story,
      summary: story.review,
      paragraphs: story.body,
      author: mapAuthor(story.author),
      prologues: mapPrologues(story.forewords),
    });
  }
}

async function fetchLatest(req: any, res: any) {
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
    result.previewGridConfig.cardsPlacement?.filter(
      (config: any) => !!config.imageSlug
    ) ?? [];

  const storyListImages =
    result.gridConfig.cardsPlacement?.filter(
      (config: any) => !!config.imageSlug
    ) ?? [];

  const storylist = {
    ...result,
    featuredImage: !result.featuredImage
      ? undefined
      : urlFor(result.featuredImage).url(),
    images:
      storyListImages.length === 0
        ? []
        : storyListImages.map((card: any) => ({
            slug: card.imageSlug,
            url: urlFor(card.image).url(),
          })),
    previewImages:
      previewImages.length === 0
        ? []
        : previewImages.map((card: any) => ({
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

export {fetchForRead, fetchLatest}