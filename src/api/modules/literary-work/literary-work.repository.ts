import type { LiteraryWork, LiteraryWorkTeaser } from '@models/literary-work.model';

export interface LiteraryWorkRepository {
	fetchBySlug(slug: string): Promise<LiteraryWork | null>;
	fetchByAuthorSlug(slug: string): Promise<LiteraryWorkTeaser[]>;
}
