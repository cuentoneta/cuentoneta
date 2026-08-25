import type { LiteraryWork, LiteraryWorkTeaser } from '@models/literary-work.model';
import type {
	LiteraryWorkIdentity,
	LiteraryWorkRepository,
	LiteraryWorkTeaserFilter,
	LiteraryWorkTeaserListing,
} from './literary-work.repository';

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
	public async fetchTeasers(filter: LiteraryWorkTeaserFilter): Promise<LiteraryWorkTeaserListing> {
		const literaryWorks = filter.author
			? this.teasers.filter(({ authors }) => authors.some((author) => author.slug === filter.author))
			: this.teasers;
		return { literaryWorks, malformed: [] };
	}

	// Resuelve contra las obras y los teasers cargados: un spec que solo pobló una de las dos listas
	// igual encuentra lo que pidió, y una obra presente en ambas se cuenta una sola vez.
	public async fetchIdsBySlugs(slugs: readonly string[]): Promise<readonly LiteraryWorkIdentity[]> {
		const known = new Map<string, string>();
		for (const { slug, _id } of [...this.literaryWorks, ...this.teasers]) {
			known.set(slug, _id);
		}
		return slugs
			.map((slug) => ({ slug, _id: known.get(slug) }))
			.filter((identity): identity is LiteraryWorkIdentity => identity._id !== undefined);
	}
}
