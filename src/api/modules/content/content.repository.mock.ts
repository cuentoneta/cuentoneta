import type { LandingPageContent, RotatingContent } from '@models/landing-page-content.model';
import type { LandingPageListQueryResult, LatestLandingPageReferencesQueryResult } from '@sanity-types';
import type { ContentRepository, KeyedReference, LandingPageCreatePayload } from './content.repository';

// La semana es la clave de búsqueda y no vive dentro del dominio —la landing no transporta su slug—,
// así que el almacenamiento la lleva al lado.
export interface StoredLandingPage {
	readonly slug: string;
	readonly content: LandingPageContent;
}

interface InMemoryContentOptions {
	readonly landingPages?: readonly StoredLandingPage[];
	readonly rotatingContent?: RotatingContent | null;
	readonly latestReferences?: LatestLandingPageReferencesQueryResult;
}

// Fake de almacenamiento: sustituye el content lake por listas en memoria, con la misma semántica de
// búsqueda. Las escrituras se acumulan y quedan observables, para que un spec de service pueda afirmar
// sobre lo escrito en vez de sobre la llamada.
export class InMemoryContentRepository implements ContentRepository {
	private readonly landingPages: readonly StoredLandingPage[];
	private readonly latestReferences: LatestLandingPageReferencesQueryResult;
	private rotatingContent: RotatingContent | null;

	public readonly createdLandingPages: LandingPageCreatePayload[] = [];

	constructor(options: InMemoryContentOptions = {}) {
		this.landingPages = options.landingPages ?? [];
		this.rotatingContent = options.rotatingContent ?? null;
		this.latestReferences = options.latestReferences ?? null;
	}

	public async fetchLandingPageContent(slug: string): Promise<LandingPageContent | null> {
		return this.landingPages.find((landingPage) => landingPage.slug === slug)?.content ?? null;
	}

	public async fetchRotatingContent(): Promise<RotatingContent | null> {
		return this.rotatingContent;
	}

	public async fetchLandingPagesList(slugs: string[]): Promise<LandingPageListQueryResult> {
		return this.landingPages
			.filter((landingPage) => slugs.includes(landingPage.slug))
			.map(({ slug, content }) => ({ _id: content._id, slug, config: content.config }));
	}

	public async fetchLatestLandingPageReferences(): Promise<LatestLandingPageReferencesQueryResult> {
		return this.latestReferences;
	}

	public async createLandingPages(landingPageObjects: LandingPageCreatePayload[]): Promise<unknown[]> {
		this.createdLandingPages.push(...landingPageObjects);
		return landingPageObjects;
	}

	// Muta la lista en vez de registrar la llamada: lo que el caso de uso promete es que la próxima
	// lectura vea lo escrito, y eso es lo que el spec tiene que poder afirmar. Las obras se resuelven
	// contra las que ya conoce el almacenamiento; una referencia a una obra desconocida no vuelve, igual
	// que una referencia colgada no resuelve en el content lake.
	public async updateMostReadLiteraryWorks(references: readonly KeyedReference[]): Promise<void> {
		if (!this.rotatingContent) {
			return;
		}
		const known = new Map(
			[
				...this.rotatingContent.mostRead,
				...this.landingPages.flatMap(({ content }) => [...content.mostRead, ...content.latestReads]),
			].map((work) => [work._id, work] as const),
		);
		this.rotatingContent = {
			...this.rotatingContent,
			mostRead: references.flatMap((reference) => known.get(reference._ref) ?? []),
		};
	}
}
