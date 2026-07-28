import type { LiteraryWork } from '@models/literary-work.model';
import { mapLiteraryWork, type SanityLiteraryWork } from '../../_utils/literary-work.functions';
import { LiteraryWorkSectionNotFoundError } from './literary-work.errors';
import type { LiteraryWorkRepository } from './literary-work.repository';

// Gemelo del SanityLiteraryWorkRepository: sustituye el almacenamiento (Sanity) por una lista en
// memoria, pero honra el mismo contrato — guarda el shape de Sanity y mapea al dominio al leer.
// No materializa (no hay CMS que persistir): el mapper deriva los reading time faltantes en el acto.
export class InMemoryLiteraryWorkRepository implements LiteraryWorkRepository {
	private readonly works: ReadonlyArray<SanityLiteraryWork>;

	constructor(works: ReadonlyArray<SanityLiteraryWork> = []) {
		this.works = works;
	}

	public async fetchBySlug(slug: string): Promise<LiteraryWork | null> {
		const raw = this.works.find((work) => work.slug === slug);
		return raw ? mapLiteraryWork(raw) : null;
	}

	public async fetchSectionBySlug(slug: string, section: number): Promise<LiteraryWork | null> {
		const full = await this.fetchBySlug(slug);
		if (!full) {
			return null;
		}
		const found = full.content.find((candidate) => candidate.position === section);
		if (!found) {
			throw new LiteraryWorkSectionNotFoundError(slug, section);
		}
		return Object.freeze({ ...full, content: [found] });
	}
}
