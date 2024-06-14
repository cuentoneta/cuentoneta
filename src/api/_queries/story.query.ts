import groq from 'groq';

export const storyPreviewCommonFields: string = `
    'slug': slug.current,
    title,
    language,
    badLanguage,
    categories,
    body[0...3],
    originalPublication,
    approximateReadingTime,
    mediaSources
`;

export const storyCommonFields: string = `
    'slug': slug.current,
    title, 
    language,
    badLanguage,
    epigraphs,
    categories, 
    body, 
    review, 
    originalPublication,
    approximateReadingTime,
    mediaSources
`;

export const storiesByAuthorSlugQuery = groq`*[_type == 'story' && author->slug.current == $slug][$slice]
{
    'slug': slug.current,
    title,
    language,
    badLanguage,
    categories,
    body[0...3],
    originalPublication,
    approximateReadingTime,
    mediaSources[]{ 
        _id,
        _type,
        title, 
        icon
        },
    resources[]{ 
        title, 
        url, 
        resourceType->{ 
            title, 
            description, 
            'icon': { 
                'name': icon.name, 
                'svg': icon.svg, 
                'provider': icon.provider 
                } 
            } 
        },
}|order(title asc)`;
