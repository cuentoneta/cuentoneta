// Sanity
import { client } from '../../_helpers/sanity-connector';

// Queries
import { authorBySlugQuery, authorsQuery } from '../../_queries/author.query';

// Errors

import { InternalError } from '../../exceptions/exceptions';
export async function fetchAuthorBySlug(slug: string) {
	try {
		return await client.fetch(authorBySlugQuery, { slug });
	} catch (err) {
		console.error('Internal server error: ', err);
		throw new InternalError('Internal server error');
	}
}

export async function fetchAllAuthors() {
	try {
		return await client.fetch(authorsQuery);
	} catch (err) {
		console.error('Internal server error: ', err);
		throw new InternalError('Internal server error');
	}
}
