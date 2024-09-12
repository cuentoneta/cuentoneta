import { defineQuery } from 'groq';

// @sanity-typegen-ignore
export const storiesByAuthorSlugQuery = defineQuery(`*[_type == 'story' && author->slug.current == $slug][$start...$end]
{
    'slug': slug.current,
    title,
    'language': coalesce(language, 'es'),
    'badLanguage': coalesce(badLanguage, false),
    'categories': coalesce(categories, []),
    'body': coalesce(body[0...3], []),
    'originalPublication': coalesce(originalPublication, ''),
    approximateReadingTime,
    'mediaSources': coalesce(mediaSources[], []),
    'resources': coalesce(resources[]{ 
        title, 
        url, 
        resourceType->{ 
            title, 
            description, 
            icon
        } 
    }, []),
}|order(title asc)`);

// @sanity-typegen-ignore
export const storyBySlugQuery = defineQuery(`*[_type == 'story' && slug.current == $slug]
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
    'mediaSources': coalesce(mediaSources[], []),
    'resources': coalesce(resources[]{
        title, 
        url, 
        resourceType->{ 
            title, 
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
                description, 
                icon
            } 
        }, [])
    }
}[0]`);
