// Sanity
import { client } from '../_helpers/sanity-connector';

// Subqueries
import { resourcesSubQuery } from '../_queries/resources.query';

// Funciones
import { mapAuthor } from '../_utils/functions';

// Interfaces
import { AuthorDTO } from '@models/author.model';

export async function getBySlug(slug: string): Promise<AuthorDTO> {
	const filter = `*[_type == 'author' && slug.current == '${slug}'][0]`;
	const fields = ['slug', 'name', 'image', 'nationality->', 'biography', resourcesSubQuery];
	const query = filter + `{ ${fields.join(',')} }`;
	const result = await client.fetch(query, {});
	return mapAuthor(result);
}
