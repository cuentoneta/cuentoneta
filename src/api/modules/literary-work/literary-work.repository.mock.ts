import type { LiteraryWork, LiteraryWorkTeaser } from '@models/literary-work.model';
import type { Collection } from '@models/collection.model';
import type { ReadingSuggestionsScope } from '@models/reading-suggestions.model';
import {
	resolveAuthorName,
	type LiteraryWorkRepository,
	type LiteraryWorkSuggestionCandidate,
	type LiteraryWorkSuggestionsListing,
	type LiteraryWorkTeaserFilter,
	type LiteraryWorkTeaserListing,
} from './literary-work.repository';

export class InMemoryLiteraryWorkRepository implements LiteraryWorkRepository {
	private readonly literaryWorks: ReadonlyArray<LiteraryWork>;
	private readonly teasers: ReadonlyArray<LiteraryWorkTeaser>;
	private readonly collections: ReadonlyArray<Collection>;

	constructor(
		literaryWorks: ReadonlyArray<LiteraryWork>,
		teasers: ReadonlyArray<LiteraryWorkTeaser>,
		collections: ReadonlyArray<Collection>,
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
	// lee de donde lee el adaptador, así que un ámbito sin nada que ofrecer deja el encabezado vacío.
	public async fetchSuggestions(
		scope: ReadingSuggestionsScope,
		select: (candidates: readonly LiteraryWorkSuggestionCandidate[]) => readonly string[],
		limit: number,
	): Promise<LiteraryWorkSuggestionsListing> {
		if ('collection' in scope) {
			const collection = this.collections.find((candidate) => candidate.slug === scope.collection);
			return collection
				? {
						title: collection.title,
						literaryWorks: selectedTeasers(collection.literaryWorks, select, limit),
						malformed: [],
					}
				: { title: '', literaryWorks: [], malformed: [] };
		}

		const literaryWorks = this.teasers.filter(({ authors }) => authors.some(({ slug }) => slug === scope.author));
		return {
			title: resolveAuthorName(literaryWorks, scope.author),
			literaryWorks: selectedTeasers(literaryWorks, select, limit),
			malformed: [],
		};
	}
}

function selectedTeasers(
	literaryWorks: readonly LiteraryWorkTeaser[],
	select: (candidates: readonly LiteraryWorkSuggestionCandidate[]) => readonly string[],
	limit: number,
): readonly LiteraryWorkTeaser[] {
	// El slug no es único entre documentos: el doble conserva la lista por slug y consume una por vez,
	// igual que el adaptador.
	const bySlug = new Map<string, LiteraryWorkTeaser[]>();
	for (const literaryWork of literaryWorks) {
		const group = bySlug.get(literaryWork.slug);
		if (group) {
			group.push(literaryWork);
		} else {
			bySlug.set(literaryWork.slug, [literaryWork]);
		}
	}
	const candidates = literaryWorks.map(({ slug, tags }) => ({ slug, tags }));
	return select(candidates)
		.map((slug) => bySlug.get(slug)?.shift())
		.filter((literaryWork): literaryWork is LiteraryWorkTeaser => literaryWork !== undefined)
		.slice(0, limit);
}
