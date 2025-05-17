import { defineQuery } from 'groq';

export const authorBySlugQuery = defineQuery(`
*[_type == 'author' && slug.current == $slug && !(_id in path('drafts.**'))][0]
{
    _id,
    slug,
    name,
    image,
    nationality->,
		biography,
    bornOn,
    diedOn,
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

export const authorsQuery = defineQuery(`
*[_type == 'author' && !(_id in path('drafts.**'))]
{
    _id,
    slug,
    name,
    image,
    nationality->,
    'biography': [],
    bornOn,
    diedOn,
    'resources': []
}|order(name asc)`);
