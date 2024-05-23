import { authorForStoryCard } from './author.query';

export const storylistPreviewQuery = `
{ 
                        _id,
                        'slug': slug.current,
                        title,
                        description,
                        language,
                        displayDates,
                        editionPrefix,
                        comingNextLabel,
                        'tags': tags[] -> {
                            title, 
                            'slug': slug.current, 
                            description, 
                            'icon': {'name': icon.name, 'provider': icon.provider, 'svg': icon.svg}
                        },
                        featuredImage,
                        'gridConfig': { 
                            'gridTemplateColumns': previewGridConfig.gridTemplateColumns,
                            'titlePlacement': previewGridConfig.titlePlacement,
                            'cardsPlacement': previewGridConfig.cardsPlacement[]
                                {
                                    'order': order,
                                    'slug': publication.story->slug.current,
                                    'startCol': startCol,
                                    'image': image,
                                    'imageSlug': imageSlug.current,
                                    'endCol': endCol,
                                    'startRow': startRow,
                                    'endRow': endRow,
                                    'publication': {
                                        'publishingOrder': publication.publishingOrder,
                                        'publishingDate': publication.publishingDate,
                                        'published': publication.published,
                                        'story': publication.story->{
                                            _id,
                                            'slug': slug.current,
                                            title,
                                            badLanguage,
                                            categories,
                                            body[0...3],
                                            review,
                                            approximateReadingTime,
                                            language,
                                            mediaSources,
                                        	${authorForStoryCard}
                                        }
                                    }
                                }
                        },
                        'count': count(*[ _type == 'publication' && storylist._ref == ^._id ])
                    }
`;

export const storylistQuery = `
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
                        'tags': tags[] -> {
                            title, 
                            'slug': slug.current, 
                            description, 
                            'icon': {'name': icon.name, 'provider': icon.provider, 'svg': icon.svg}
                        },
                        'gridConfig': {
                            'gridTemplateColumns': gridConfig.gridTemplateColumns,
                            'titlePlacement': gridConfig.titlePlacement,
                            'cardsPlacement': gridConfig.cardsPlacement[]
                            {
                                'order': order,
                                'slug': publication.story->slug.current,
                                'startCol': startCol,
                                'image': image,
                                'imageSlug': imageSlug.current,
                                'endCol': endCol,
                                'startRow': startRow,
                                'endRow': endRow,
                                'publication': {
                                     'publishingOrder': publication.publishingOrder,
                                     'publishingDate': publication.publishingDate,
                                     'published': publication.published,
                                     'story': publication.story->{
                                        _id,
                                        'slug': slug.current,
                                        title,
                                        categories,
                                        body[0...3],
                                        review,
                                        approximateReadingTime,
                                        language,
                                        mediaSources,
                                        ${authorForStoryCard}
                                    }
                                }
                          	}
                        },
                        'count': count(*[ _type == 'publication' && storylist._ref == ^._id ])
                }
`;
