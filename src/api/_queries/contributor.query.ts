import { defineQuery } from 'groq';

export const allContributorsQuery = defineQuery(`
*[_type == 'contributor' && !(_id in path('drafts.**'))]
{
	name,
	'slug': slug.current,
	area,
	link {
		handle,
		url
	},
	notes
}|order(name asc)
`);
