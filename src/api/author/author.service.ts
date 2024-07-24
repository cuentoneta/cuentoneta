// Sanity
import { client } from '../_helpers/sanity-connector';
import { authorBySlugQuery } from '../_queries/author.query';

// Funciones
import { mapAuthor } from '../_utils/functions';

// Interfaces
import { AuthorDTO } from '@models/author.model';
import { AuthorBySlugQueryResult } from '../sanity/types';

export async function getBySlug(slug: string): Promise<AuthorDTO> {
	const result: AuthorBySlugQueryResult = await client.fetch(authorBySlugQuery, { slug });
	return mapAuthor(result);
}
