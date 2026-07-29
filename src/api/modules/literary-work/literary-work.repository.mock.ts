import type { LiteraryWork } from '@models/literary-work.model';
import type { LiteraryWorkRepository } from './literary-work.repository';

export class InMemoryLiteraryWorkRepository implements LiteraryWorkRepository {
	private readonly literaryWorks: ReadonlyArray<LiteraryWork>;

	constructor(literaryWorks: ReadonlyArray<LiteraryWork> = []) {
		this.literaryWorks = literaryWorks;
	}

	public async fetchBySlug(slug: string): Promise<LiteraryWork | null> {
		return this.literaryWorks.find((literaryWork) => literaryWork.slug === slug) ?? null;
	}
}
