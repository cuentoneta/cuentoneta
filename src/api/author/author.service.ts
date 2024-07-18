// Sanity
import { client } from '../_helpers/sanity-connector';
import { authorBySlugQuery } from '../_queries/author.query';

// Funciones
import { mapAuthor } from '../_utils/functions';

// Interfaces
import { AuthorDTO } from '@models/author.model';

export async function getBySlug(slug: string): Promise<AuthorDTO> {
	const result = await client.fetch(authorBySlugQuery, { slug });
	return mapAuthor(result);
}
