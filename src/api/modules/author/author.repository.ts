// Sanity
import { getClient } from '../../_helpers/sanity-connector';

// Queries
import { authorBySlugQuery, authorsQuery } from '../../_queries/author.query';

export async function fetchAuthorBySlug(slug: string) {
	return getClient().fetch(authorBySlugQuery, { slug });
}

export async function fetchAllAuthors() {
	return getClient().fetch(authorsQuery);
}
