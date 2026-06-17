// Interfaces
import { AuthorProfile, AuthorTeaser } from '@models/author.model';

// Funciones de mapeo
import { mapAuthorProfile, mapAuthorTeaser } from '../../_utils/functions';

// Funciones de repository
import { fetchAllAuthors, fetchAuthorBySlug } from './author.repository';

export async function getAuthorBySlug(slug: string): Promise<AuthorProfile> {
	const result = await fetchAuthorBySlug(slug);

	if (!result) {
		throw new Error(`Author with slug ${slug} not found.`);
	}

	return mapAuthorProfile(result);
}

export async function getAllAuthors(): Promise<AuthorTeaser[]> {
	const result = await fetchAllAuthors();

	if (!result) {
		throw new Error(`Could not fetch authors data.`);
	}

	const authors = result.map((author) => mapAuthorTeaser(author));
	return authors;
}
