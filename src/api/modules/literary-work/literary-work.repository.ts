import { client } from '../../_helpers/sanity-connector';
import { literaryWorkBySlugQuery } from '../../_queries/literary-work.query';
import type { LiteraryWorkBySlugQueryResult } from '../../sanity/types';

export interface LiteraryWorkRepository {
	fetchBySlug(slug: string): Promise<LiteraryWorkBySlugQueryResult>;
}

export class SanityLiteraryWorkRepository implements LiteraryWorkRepository {
	public async fetchBySlug(slug: string): Promise<LiteraryWorkBySlugQueryResult> {
		return client.fetch(literaryWorkBySlugQuery, { slug });
	}
}
