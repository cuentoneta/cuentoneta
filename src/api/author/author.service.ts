// Sanity
import { client } from '../_helpers/sanity-connector';
import { authorBySlugQuery, authorsQuery } from '../_queries/author.query';

// Funciones
import { mapAuthor, mapAuthorTeaser } from '../_utils/functions';

// Interfaces
import { Author, AuthorTeaser } from '@models/author.model';

export async function getBySlug(slug: string): Promise<Author> {
	const result = await client.fetch(authorBySlugQuery, { slug });

	if (!result) {
		throw new Error(`Author with slug ${slug} not found`);
	}

	return mapAuthor(result);
}

export async function getAll(): Promise<AuthorTeaser[]> {
	const result = await client.fetch(authorsQuery);
	const authors = result.map((author) => mapAuthorTeaser(author));
	return authors;
}
