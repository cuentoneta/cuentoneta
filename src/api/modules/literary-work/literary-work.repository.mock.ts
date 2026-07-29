import type { LiteraryWork } from '@models/literary-work.model';
import { projectSingleSection, type LiteraryWorkRepository } from './literary-work.repository';

// Doble de almacenamiento (Fake): sustituye Sanity por una lista en memoria de agregados de dominio ya
// materializados. No traduce ni persiste — la anti-corruption es del adaptador Sanity; este solo honra el
// contrato del puerto sirviendo dominio canned y proyectando secciones con el mismo helper compartido.
export class InMemoryLiteraryWorkRepository implements LiteraryWorkRepository {
	private readonly works: ReadonlyArray<LiteraryWork>;

	constructor(works: ReadonlyArray<LiteraryWork> = []) {
		this.works = works;
	}

	public async fetchBySlug(slug: string): Promise<LiteraryWork | null> {
		return this.works.find((work) => work.slug === slug) ?? null;
	}

	public async fetchSectionBySlug(slug: string, section: number): Promise<LiteraryWork | null> {
		const full = await this.fetchBySlug(slug);
		return full ? projectSingleSection(full, slug, section) : null;
	}
}
