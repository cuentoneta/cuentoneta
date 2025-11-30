// Interfaces
import { Author, AuthorTeaser } from '@models/author.model';

// Funciones de mapeo
import { mapAuthor, mapAuthorTeaser } from '../../_utils/functions';

// Funciones de repository
import { fetchAllAuthors, fetchAuthorBySlug } from './author.repository';

export async function getAuthorBySlug(slug: string): Promise<Author> {
	const result = await fetchAuthorBySlug(slug);

	if (!result) {
		throw new Error(`Author with slug ${slug} not found.`);
	}

	return mapAuthor(result);
}

export async function getAllAuthors(): Promise<AuthorTeaser[]> {
	const result = await fetchAllAuthors();

	if (!result) {
		throw new Error(`Could not fetch authors data.`);
	}

	const authors = result.map((author) => mapAuthorTeaser(author));
	return authors;
}
