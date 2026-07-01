import { defineQuery } from 'groq';

export const authorBySlugQuery = defineQuery(`
*[_type == 'author' && slug.current == $slug && !(_id in path('drafts.**'))][0]
{
    _id,
    'slug': slug.current,
    'createdAt': _createdAt,
    'updatedAt': _updatedAt,
    name,
    image,
    nationality->,
    biography,
    bornOn,
		bornOnYear,
    diedOn,
		diedOnYear,
    'resources': coalesce(resources[]{
        title,
        url,
        resourceType->{
        	'slug': slug.current,
        	title,
        	shortDescription,
        	description,
            icon
        }
    }, []),
    'tags': coalesce(tags[] -> {
        title,
        'slug': slug.current,
        shortDescription,
        description,
        icon,
        backgroundColor,
        textColor
    }, [])
}`);

export const authorsQuery = defineQuery(`
*[_type == 'author' && !(_id in path('drafts.**'))]
{
    _id,
    'slug': slug.current,
    name,
    image,
    nationality->,
    'biography': [],
    bornOn,
 		bornOnYear,
    diedOn,
    diedOnYear,
    'resources': []
}|order(name asc)`);
