import type { LiteraryWork, LiteraryWorkTeaser } from '@models/literary-work.model';
import type { LiteraryWorkRepository, LiteraryWorkTeaserListing } from './literary-work.repository';

export class InMemoryLiteraryWorkRepository implements LiteraryWorkRepository {
	private readonly literaryWorks: ReadonlyArray<LiteraryWork>;
	private readonly teasers: ReadonlyArray<LiteraryWorkTeaser>;

	constructor(literaryWorks: ReadonlyArray<LiteraryWork> = [], teasers: ReadonlyArray<LiteraryWorkTeaser> = []) {
		this.literaryWorks = literaryWorks;
		this.teasers = teasers;
	}

	public async fetchBySlug(slug: string): Promise<LiteraryWork | null> {
		return this.literaryWorks.find((literaryWork) => literaryWork.slug === slug) ?? null;
	}

	// Nada que traducir significa nada que reportar: el doble trabaja sobre teasers ya construidos,
	// así que `malformed` es siempre vacío.
	public async fetchByAuthorSlug(slug: string): Promise<LiteraryWorkTeaserListing> {
		return {
			literaryWorks: this.teasers.filter(({ authors }) => authors.some((author) => author.slug === slug)),
			malformed: [],
		};
	}
}
