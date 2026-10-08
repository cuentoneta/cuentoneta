import {
	createLiteraryWorkNavigationTeaser,
	type LiteraryWork,
	type LiteraryWorkNavigationTeaserWithAuthors,
	type LiteraryWorkTeaser,
} from '@models/literary-work.model';
import type {
	LiteraryWorkNavigationTeaserWithAuthorsListing,
	LiteraryWorkRepository,
	LiteraryWorkTeaserFilter,
	LiteraryWorkTeaserListing,
} from './literary-work.repository';

// La vista de navegación es el teaser sin el extracto: se proyecta desde lo que el doble ya almacena
// en vez de cargar una segunda lista a mano. La factory hace cumplir sus invariantes, como el
// adaptador de Sanity, y enumerar los campos impide que uno del teaser se cuele en la vista.
function toNavigationTeaser(teaser: LiteraryWorkTeaser): LiteraryWorkNavigationTeaserWithAuthors {
	return createLiteraryWorkNavigationTeaser({
		_id: teaser._id,
		slug: teaser.slug,
		title: teaser.title,
		coverImage: teaser.coverImage,
		totalReadingTime: teaser.totalReadingTime,
		sectionCount: teaser.sectionCount,
		tags: teaser.tags,
		mediaSources: teaser.mediaSources,
		authors: teaser.authors,
	});
}

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

	public async fetchNavigationTeasersWithAuthors(): Promise<LiteraryWorkNavigationTeaserWithAuthorsListing> {
		return { literaryWorks: this.teasers.map(toNavigationTeaser), malformed: [] };
	}
}
