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
	//
	// **Devuelve en orden de almacenamiento, no en el de la consulta**, que es lo que hace la query real:
	// filtra por pertenencia y entrega en orden de documento. Un doble que respetara el orden pedido
	// haría pasar en verde a cualquier llamador que dependa de un orden que Sanity no promete.
	public async fetchIdsBySlugs(slugs: readonly string[]): Promise<readonly LiteraryWorkIdentity[]> {
		const requested = new Set(slugs);
		const stored = new Map<string, string>();
		for (const { slug, _id } of [...this.literaryWorks, ...this.teasers]) {
			stored.set(slug, _id);
		}
		return [...stored].filter(([slug]) => requested.has(slug)).map(([slug, _id]) => ({ _id, slug }));
	}
}
