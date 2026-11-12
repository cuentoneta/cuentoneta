import type { LiteraryWork, LiteraryWorkCatalogEntry, LiteraryWorkTeaser } from '@models/literary-work.model';
import type {
	LiteraryWorkCatalogFilter,
	LiteraryWorkListing,
	LiteraryWorkRepository,
	LiteraryWorkTeaserFilter,
	LiteraryWorkTeaserListing,
} from './literary-work.repository';

export class InMemoryLiteraryWorkRepository implements LiteraryWorkRepository {
	private readonly literaryWorks: ReadonlyArray<LiteraryWork>;
	private readonly teasers: ReadonlyArray<LiteraryWorkTeaser>;
	private readonly catalog: ReadonlyArray<LiteraryWorkCatalogEntry>;

	constructor(
		literaryWorks: ReadonlyArray<LiteraryWork> = [],
		teasers: ReadonlyArray<LiteraryWorkTeaser> = [],
		catalog: ReadonlyArray<LiteraryWorkCatalogEntry> = [],
	) {
		this.literaryWorks = literaryWorks;
		this.teasers = teasers;
		this.catalog = catalog;
	}

	public async fetchBySlug(slug: string): Promise<LiteraryWork | null> {
		return this.literaryWorks.find((literaryWork) => literaryWork.slug === slug) ?? null;
	}

	// Nada que traducir significa nada que reportar: el doble trabaja sobre teasers ya construidos,
	// así que `malformed` es siempre vacío.
	public async fetchTeasers(filter: LiteraryWorkTeaserFilter): Promise<LiteraryWorkTeaserListing> {
		// Los dos criterios se acumulan, y ninguno reordena: la query filtra por pertenencia y entrega en
		// orden de documento, así que el doble entrega en orden de almacenamiento. Respetar el orden en
		// que vinieran los slugs taparía a un consumidor que dependa de un orden que Sanity no da.
		const byAuthor = this.byAuthor(this.teasers, filter.author);
		const slugs = filter.slugs;
		const literaryWorks = slugs ? byAuthor.filter(({ slug }) => slugs.includes(slug)) : byAuthor;
		return { literaryWorks, malformed: [] };
	}

	public async fetchCatalog(
		filter: LiteraryWorkCatalogFilter,
	): Promise<LiteraryWorkListing<LiteraryWorkCatalogEntry>> {
		return { literaryWorks: this.byAuthor(this.catalog, filter.author), malformed: [] };
	}

	private byAuthor<T extends { readonly authors: readonly { readonly slug: string }[] }>(
		literaryWorks: ReadonlyArray<T>,
		author: string | undefined,
	): ReadonlyArray<T> {
		return author ? literaryWorks.filter(({ authors }) => authors.some(({ slug }) => slug === author)) : literaryWorks;
	}
}
