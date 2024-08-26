import groq from 'groq';

export const storylistPreviewQuery = groq`*[_type == 'storylist' && slug.current == $slug][0]
{ 
    'slug': slug.current,
    title,
    description,
    language,
    displayDates,
    editionPrefix,
    comingNextLabel,
    featuredImage,
    'tags': coalesce(tags[] -> {
        title, 
        'slug': slug.current, 
        description, 
        'icon': {'name': icon.name, 'provider': icon.provider, 'svg': icon.svg}
    }, []),
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
                    'slug': slug.current,
                    title,
                    language,
                    badLanguage,
                    categories,
                    body[0...3],
                    originalPublication,
                    approximateReadingTime,
                    'mediaSources': coalesce(mediaSources[]{
                        _id,
                        _type,
                        title, 
                        icon
                    }, []),
                	'author': author->{
                        slug,
                        name,
                        image,
                        nationality->
                    }
                }
            }
        }
    },
    'count': count(*[ _type == 'publication' && storylist._ref == ^._id ])
    }
`;

export const storylistQuery = groq`*[_type == 'storylist' && slug.current == $slug][0]
{ 
    'slug': slug.current,
    title,
    description,
    language,
    displayDates,
    editionPrefix,
    comingNextLabel,
    featuredImage,
    'tags': coalesce(tags[] -> {
        title, 
        'slug': slug.current, 
        description, 
        'icon': {'name': icon.name, 'provider': icon.provider, 'svg': icon.svg}
    }, []),
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
                'editionPrefix': publication.editionPrefix,
                'comingNextLabel': publication.comingNextLabel,
                'story': publication.story->{
                    'slug': slug.current,
                    title,
                    language,
                    badLanguage,
                    categories,
                    body[0...3],
                    originalPublication,
                    approximateReadingTime,
                    'mediaSources': coalesce(mediaSources[]{
                        _id,
                        _type,
                        title, 
                        icon
                    }, []),
                	'author': author->{
                        slug,
                        name,
                        image,
                        nationality->
                    }
                }
            }
        }
    },
    'count': count(*[ _type == 'publication' && storylist._ref == ^._id ])
    }
`;
