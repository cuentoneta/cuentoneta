import { defineQuery } from 'groq';

export const authorBySlugQuery = defineQuery(`
*[_type == 'author' && slug.current == $slug && !(_id in path('drafts.**'))][0]
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
