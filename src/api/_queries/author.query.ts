import groq from 'groq';

export const authorBySlugQuery = groq`*[_type == 'author' && slug.current == $slug][0]
{
    slug,
    name,
    image,
    nationality->,
    biography,
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
        }
}`;
