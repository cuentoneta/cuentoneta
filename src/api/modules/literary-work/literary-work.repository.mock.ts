import type { LiteraryWorkBySlugQueryResult } from '../../sanity/types';
import type { LiteraryWorkRepository } from './literary-work.repository';

export class InMemoryLiteraryWorkRepository implements LiteraryWorkRepository {
	private readonly works: ReadonlyArray<NonNullable<LiteraryWorkBySlugQueryResult>>;

	constructor(works: ReadonlyArray<NonNullable<LiteraryWorkBySlugQueryResult>> = []) {
		this.works = works;
	}

	public async fetchBySlug(slug: string): Promise<LiteraryWorkBySlugQueryResult> {
		return this.works.find((work) => work.slug === slug) ?? null;
	}
}
