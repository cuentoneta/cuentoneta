import type { LiteraryWork } from '@models/literary-work.model';

export interface LiteraryWorkRepository {
	fetchBySlug(slug: string): Promise<LiteraryWork | null>;
}
