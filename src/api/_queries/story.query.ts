import { defineQuery } from 'groq';

export const storiesByAuthorSlugQuery = defineQuery(`*[_type == 'story' && author->slug.current == $slug][$start...$end]
{
    'slug': slug.current,
    title,
    'language': coalesce(language, 'es'),
    'badLanguage': coalesce(badLanguage, false),
    'body': coalesce(body[0...3], []),
    'originalPublication': coalesce(originalPublication, ''),
    approximateReadingTime,
    'mediaSources': coalesce(mediaSources[], []),
    'resources': coalesce(resources[]{ 
        title, 
        url, 
        resourceType->{ 
            title, 
            shortDescription,
            description, 
            icon
        } 
    }, []),
}|order(title asc)`);

export const storyBySlugQuery = defineQuery(`*[_type == 'story' && slug.current == $slug]
{
    'slug': slug.current,
    title, 
    'language': coalesce(language, 'es'),
    'badLanguage': coalesce(badLanguage, false),
    'epigraphs': coalesce(epigraphs[]{
        text,
        'reference': coalesce(reference[], [])
    }, []),
    'body': coalesce(body, []),
    'review': coalesce(review, []),
    'originalPublication': coalesce(originalPublication, ''),
    approximateReadingTime,
    'mediaSources': coalesce(mediaSources[], []),
    'resources': coalesce(resources[]{
        title, 
        url, 
        resourceType->{ 
            title, 
            shortDescription,
            description,
            icon
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
                shortDescription,
                description, 
                icon
            } 
        }, [])
    }
}[0]`);
