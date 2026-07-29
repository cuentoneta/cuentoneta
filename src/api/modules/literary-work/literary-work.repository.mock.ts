import type { LiteraryWork } from '@models/literary-work.model';
import type { LiteraryWorkRepository } from './literary-work.repository';

// Doble de almacenamiento (Fake): sustituye Sanity por una lista en memoria de agregados de dominio ya
// materializados. No traduce ni persiste — la anti-corruption es del adaptador Sanity; este solo honra el
// contrato del puerto sirviendo dominio canned.
export class InMemoryLiteraryWorkRepository implements LiteraryWorkRepository {
	private readonly works: ReadonlyArray<LiteraryWork>;

	constructor(works: ReadonlyArray<LiteraryWork> = []) {
		this.works = works;
	}

	public async fetchBySlug(slug: string): Promise<LiteraryWork | null> {
		return this.works.find((work) => work.slug === slug) ?? null;
	}
}
