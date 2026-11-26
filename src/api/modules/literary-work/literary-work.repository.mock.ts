import type { LiteraryWork, LiteraryWorkCatalogEntry, LiteraryWorkTeaser } from '@models/literary-work.model';
import { compareSlugs } from '@models/slug.model';
import type {
	LiteraryWorkCatalogEntryFetchResult,
	LiteraryWorkRepository,
	LiteraryWorkTeaserFilter,
	LiteraryWorkTeaserFetchResult,
} from './literary-work.repository';

interface InMemoryLiteraryWorkRepositoryOptions {
	readonly literaryWorks?: ReadonlyArray<LiteraryWork>;
	readonly teasers?: ReadonlyArray<LiteraryWorkTeaser>;
	readonly catalogEntries?: ReadonlyArray<LiteraryWorkCatalogEntry>;
}

export class InMemoryLiteraryWorkRepository implements LiteraryWorkRepository {
	private readonly literaryWorks: ReadonlyArray<LiteraryWork>;
	private readonly teasers: ReadonlyArray<LiteraryWorkTeaser>;
	private readonly catalogEntries: ReadonlyArray<LiteraryWorkCatalogEntry>;

	constructor({ literaryWorks = [], teasers = [], catalogEntries = [] }: InMemoryLiteraryWorkRepositoryOptions = {}) {
		this.literaryWorks = literaryWorks;
		this.teasers = teasers;
		this.catalogEntries = catalogEntries;
	}

	public async fetchBySlug(slug: string): Promise<LiteraryWork | null> {
		return this.literaryWorks.find((literaryWork) => literaryWork.slug === slug) ?? null;
	}

	// Nada que traducir significa nada que reportar: el doble trabaja sobre teasers ya construidos,
	// así que `malformed` es siempre vacío.
	public async fetchTeasers(filter: LiteraryWorkTeaserFilter): Promise<LiteraryWorkTeaserFetchResult> {
		// Los dos criterios se acumulan, y ninguno reordena: la query filtra por inclusión en el conjunto y entrega en
		// orden de documento, así que el doble entrega en orden de almacenamiento. Respetar el orden en
		// que vinieran los slugs taparía a un consumidor que dependa de un orden que Sanity no da.
		const byAuthor = filter.author
			? this.teasers.filter(({ authors }) => authors.some((author) => author.slug === filter.author))
			: this.teasers;
		const slugs = filter.slugs;
		const teasers = slugs ? byAuthor.filter(({ slug }) => slugs.includes(slug)) : byAuthor;
		return { teasers, malformed: [] };
	}

	// A diferencia de los avances, acá el doble sí ordena: el puerto promete el orden por slug, así que
	// entregar en orden de almacenamiento dejaría a un consumidor probando contra un orden que producción no
	// tiene.
	public async fetchCatalogEntries(): Promise<LiteraryWorkCatalogEntryFetchResult> {
		const catalogEntries = [...this.catalogEntries].sort((a, b) => compareSlugs(a.slug, b.slug));
		return { catalogEntries, malformed: [] };
	}
}
