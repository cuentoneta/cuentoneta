import groq from 'groq';
import { authorForStoryCard } from './author.query';
import { storyPreviewCommonFields } from './story.query';

const tags = `
    'tags': tags[] -> {
        title, 
        'slug': slug.current, 
        description, 
        'icon': {'name': icon.name, 'provider': icon.provider, 'svg': icon.svg}
    }
`;

const commonFields = `
    'slug': slug.current,
    title,
    description,
    language,
    displayDates,
    editionPrefix,
    comingNextLabel,
    featuredImage,
    ${tags}
`;

const gridConfig = (config: 'previewGridConfig' | 'gridConfig') => `
'gridConfig': { 
    'gridTemplateColumns': ${config}.gridTemplateColumns,
    'titlePlacement': ${config}.titlePlacement,
    'cardsPlacement': ${config}.cardsPlacement[]
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
                ${storyPreviewCommonFields},
            	${authorForStoryCard}
            }
        }
    }
}
`;

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
    'tags': tags[] -> {
        title, 
        'slug': slug.current, 
        description, 
        'icon': {'name': icon.name, 'provider': icon.provider, 'svg': icon.svg}
    },
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
                    mediaSources,
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

export const storylistQuery = `
{ 
    ${commonFields},
    ${gridConfig('gridConfig')},
    'count': count(*[ _type == 'publication' && storylist._ref == ^._id ])
}
`;
