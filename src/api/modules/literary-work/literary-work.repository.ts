import type { LiteraryWork } from '@models/literary-work.model';
import { client } from '../../_helpers/sanity-connector';
import { literaryWorkBySlugQuery } from '../../_queries/literary-work.query';
import { mapLiteraryWork } from '../../_utils/literary-work.functions';

export interface LiteraryWorkRepository {
	fetchBySlug(slug: string): Promise<LiteraryWork | null>;
}

export class SanityLiteraryWorkRepository implements LiteraryWorkRepository {
	public async fetchBySlug(slug: string): Promise<LiteraryWork | null> {
		const raw = await client.fetch(literaryWorkBySlugQuery, { slug });
		return raw ? mapLiteraryWork(raw) : null;
	}
}
