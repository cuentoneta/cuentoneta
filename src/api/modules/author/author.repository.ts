// Sanity
import { client } from '../../_helpers/sanity-connector';

// Queries
import { authorBySlugQuery, authorsQuery } from '../../_queries/author.query';

/**
 * Fetches a single author by slug
 */
export async function fetchBySlug(slug: string) {
	return client.fetch(authorBySlugQuery, { slug });
}

/**
 * Fetches all authors
 */
export async function fetchAll() {
	return client.fetch(authorsQuery);
}
