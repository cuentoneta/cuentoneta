import { resolveAuthorName, type LiteraryWork, type LiteraryWorkTeaser } from '@models/literary-work.model';
import type { Collection } from '@models/collection.model';
import type { ReadingSuggestionsScope } from '@models/reading-suggestions.model';
import type {
	LiteraryWorkRepository,
	LiteraryWorkSuggestionsListing,
	LiteraryWorkTeaserFilter,
	LiteraryWorkTeaserListing,
} from './literary-work.repository';

export class InMemoryLiteraryWorkRepository implements LiteraryWorkRepository {
	private readonly literaryWorks: ReadonlyArray<LiteraryWork>;
	private readonly teasers: ReadonlyArray<LiteraryWorkTeaser>;
	private readonly collections: ReadonlyArray<Collection>;

	constructor(
		literaryWorks: ReadonlyArray<LiteraryWork> = [],
		teasers: ReadonlyArray<LiteraryWorkTeaser> = [],
		collections: ReadonlyArray<Collection> = [],
	) {
		this.literaryWorks = literaryWorks;
		this.teasers = teasers;
		this.collections = collections;
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
		const byAuthor = filter.author
			? this.teasers.filter(({ authors }) => authors.some((author) => author.slug === filter.author))
			: this.teasers;
		const slugs = filter.slugs;
		const literaryWorks = slugs ? byAuthor.filter(({ slug }) => slugs.includes(slug)) : byAuthor;
		return { literaryWorks, malformed: [] };
	}

	// El ámbito de autor sale de los teasers ya cargados y el de colección, de las colecciones: el doble
	// traduce los dos con la misma regla que el adaptador de Sanity, así que un ámbito sin nada que
	// ofrecer devuelve el encabezado vacío.
	public async fetchSuggestions(scope: ReadingSuggestionsScope): Promise<LiteraryWorkSuggestionsListing> {
		if ('collection' in scope) {
			const collection = this.collections.find((candidate) => candidate.slug === scope.collection);
			return collection
				? { title: collection.title, literaryWorks: collection.literaryWorks, malformed: [] }
				: { title: '', literaryWorks: [], malformed: [] };
		}

		const literaryWorks = this.teasers.filter(({ authors }) => authors.some((author) => author.slug === scope.author));
		return { title: resolveAuthorName(literaryWorks, scope.author), literaryWorks, malformed: [] };
	}
}
