import { defineQuery } from 'groq';

export const storiesByAuthorSlugQuery = defineQuery(`
*[_type == 'story' && author->slug.current == $slug && !(_id in path('drafts.**'))][$start...$end]
{
    _id,
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

export const storyBySlugQuery = defineQuery(`
*[_type == 'story' && slug.current == $slug && !(_id in path('drafts.**'))]
{
    _id,
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
        _id,
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

export const storiesBySlugsQuery = defineQuery(`
*[_type == 'story' && slug.current in $slugs && !(_id in path('drafts.**'))]
{
    _id,
    'slug': slug.current,
    title, 
    'language': coalesce(language, 'es'),
    'badLanguage': coalesce(badLanguage, false),
    'epigraphs': [],
    'body': [],
    'review': [],
    'originalPublication': coalesce(originalPublication, ''),
    approximateReadingTime,
    'mediaSources': coalesce(mediaSources[], []),
    'resources': [],
    'author': author-> {
        _id,
        slug,
        name,
        image,
        nationality->,
        'biography': [],
        'resources': []
    }
}`);
