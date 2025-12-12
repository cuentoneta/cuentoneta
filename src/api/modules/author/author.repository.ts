// Sanity
import { client } from '../../_helpers/sanity-connector';

// Queries
import { authorBySlugQuery, authorsQuery } from '../../_queries/author.query';

// Errors

import { InternalError, NotFoundError } from '../../exceptions/exceptions';
export async function fetchAuthorBySlug(slug: string) {
	try {
		return await client.fetch(authorBySlugQuery, { slug });
	} catch (err) {
		throw new InternalError('Internal server error');
	}
}

export async function fetchAllAuthors() {
	try {
		return await client.fetch(authorsQuery);
	} catch (err) {
		throw new InternalError('Internal server error');
	}
}
