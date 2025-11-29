// Sanity
import { client } from '../../_helpers/sanity-connector';

// Queries
import { authorBySlugQuery, authorsQuery } from '../../_queries/author.query';

export async function fetchAuthorBySlug(slug: string) {
	return client.fetch(authorBySlugQuery, { slug });
}

export async function fetchAllAuthors() {
	return client.fetch(authorsQuery);
}
