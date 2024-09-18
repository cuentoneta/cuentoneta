import { defineQuery } from 'groq';

// @sanity-typegen-ignore
export const authorBySlugQuery = defineQuery(`*[_type == 'author' && slug.current == $slug][0]
{
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
}`);
