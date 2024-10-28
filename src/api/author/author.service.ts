// Sanity
import { client } from '../_helpers/sanity-connector';
import { authorBySlugQuery } from '../_queries/author.query';

// Funciones
import { mapAuthor } from '../_utils/functions';

// Interfaces
import { Author } from '@models/author.model';

export async function getBySlug(slug: string): Promise<Author> {
	const result = await client.fetch(authorBySlugQuery, { slug });

	if (!result) {
		throw new Error(`Author with slug ${slug} not found`);
	}

	return mapAuthor(result);
}
