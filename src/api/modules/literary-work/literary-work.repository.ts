import type { LiteraryWork } from '@models/literary-work.model';
import { client } from '../../_helpers/sanity-connector';
import { literaryWorkBySlugQuery } from '../../_queries/literary-work.query';
import { mapLiteraryWork } from '../../_utils/literary-work.functions';

// El repository es la frontera del ACL: traduce el shape de Sanity al dominio (delegando en el mapper
// puro de _utils) y expone SOLO objetos de dominio. El service nunca ve el shape crudo.
export interface LiteraryWorkRepository {
	fetchBySlug(slug: string): Promise<LiteraryWork | null>;
}

export class SanityLiteraryWorkRepository implements LiteraryWorkRepository {
	public async fetchBySlug(slug: string): Promise<LiteraryWork | null> {
		const raw = await client.fetch(literaryWorkBySlugQuery, { slug });
		return raw ? mapLiteraryWork(raw) : null;
	}
}
