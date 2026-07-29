import type { LiteraryWork } from '@models/literary-work.model';
import type { LiteraryWorkRepository } from './literary-work.repository';

export class InMemoryLiteraryWorkRepository implements LiteraryWorkRepository {
	private readonly works: ReadonlyArray<LiteraryWork>;

	constructor(works: ReadonlyArray<LiteraryWork> = []) {
		this.works = works;
	}

	public async fetchBySlug(slug: string): Promise<LiteraryWork | null> {
		return this.works.find((work) => work.slug === slug) ?? null;
	}
}
