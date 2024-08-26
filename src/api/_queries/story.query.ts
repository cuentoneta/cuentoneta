import groq from 'groq';

export const storiesByAuthorSlugQuery = groq`*[_type == 'story' && author->slug.current == $slug][$start...$end]
{
    'slug': slug.current,
    title,
    'language': coalesce(language, 'es'),
    'badLanguage': coalesce(badLanguage, false),
    'categories': coalesce(categories, []),
    'body': coalesce(body[0...3], []),
    'originalPublication': coalesce(originalPublication, ''),
    approximateReadingTime,
    'mediaSources': coalesce(mediaSources[]{
        _id,
        _type,
        title, 
        icon
    }, []),
    'resources': coalesce(resources[]{ 
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
    }, []),
}|order(title asc)`;

export const storyBySlugQuery = groq`*[_type == 'story' && slug.current == $slug]
{
    'slug': slug.current,
    title, 
    'language': coalesce(language, 'es'),
    'badLanguage': coalesce(badLanguage, false),
    'epigraphs': coalesce(epigraphs[]{
        text,
        reference
    }, []),
    'categories': coalesce(categories, []),
    'body': coalesce(body, []),
    'review': coalesce(review, []),
    'originalPublication': coalesce(originalPublication, ''),
    approximateReadingTime,
    'mediaSources': coalesce(mediaSources[]{
        _id,
        _type,
        title, 
        icon
    }, []),
    'resources': coalesce(resources[]{
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
    }, []),
    'author': author-> {
        slug,
        name,
        image,
        nationality->,
        biography,
        'resources': coalesce(resources[]{ 
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
        }, [])
    }
}[0]`;
