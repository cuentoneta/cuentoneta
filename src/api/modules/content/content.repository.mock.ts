import type { LandingPageContent, RotatingContent } from '@models/landing-page-content.model';
import type { LiteraryWorkNavigationTeaserWithAuthors } from '@models/literary-work.model';
import { RotatingContentNotFoundError } from './content.errors';
import type {
	ContentRepository,
	LandingPageCreatePayload,
	LandingPageReferences,
	LandingPageSummary,
} from './content.repository';

// La semana es la clave de búsqueda y no vive dentro del dominio —la landing no transporta su slug—,
// así que el almacenamiento la lleva al lado.
export interface StoredLandingPage {
	readonly slug: string;
	readonly content: LandingPageContent;
}

interface InMemoryContentOptions {
	readonly landingPages?: readonly StoredLandingPage[];
	readonly rotatingContent?: RotatingContent | null;
	readonly latestReferences?: LandingPageReferences | null;
	// El catálogo contra el que se resuelven las referencias que se escriben. Sustituye al content lake:
	// sin él, el doble solo podría reapuntar el slot a lo que ya estaba en el slot.
	readonly literaryWorks?: readonly LiteraryWorkNavigationTeaserWithAuthors[];
}

// Fake de almacenamiento: sustituye el content lake por listas en memoria, con la misma semántica de
// búsqueda. Las escrituras se acumulan y quedan observables, para que un spec de service pueda afirmar
// sobre lo escrito en vez de sobre la llamada.
export class InMemoryContentRepository implements ContentRepository {
	private readonly landingPages: readonly StoredLandingPage[];
	private readonly latestReferences: LandingPageReferences | null;
	private readonly literaryWorks: readonly LiteraryWorkNavigationTeaserWithAuthors[];
	private rotatingContent: RotatingContent | null;

	public readonly createdLandingPages: LandingPageCreatePayload[] = [];

	constructor(options: InMemoryContentOptions = {}) {
		this.landingPages = options.landingPages ?? [];
		this.rotatingContent = options.rotatingContent ?? null;
		this.latestReferences = options.latestReferences ?? null;
		this.literaryWorks = options.literaryWorks ?? [];
	}

	public async fetchLandingPageContent(slug: string): Promise<LandingPageContent | null> {
		return this.landingPages.find((landingPage) => landingPage.slug === slug)?.content ?? null;
	}

	public async fetchRotatingContent(): Promise<RotatingContent | null> {
		return this.rotatingContent;
	}

	public async fetchLandingPagesList(slugs: string[]): Promise<readonly LandingPageSummary[]> {
		return this.landingPages
			.filter((landingPage) => slugs.includes(landingPage.slug))
			.map(({ slug, content }) => ({ _id: content._id, slug, config: content.config }));
	}

	public async fetchLatestLandingPageReferences(): Promise<LandingPageReferences | null> {
		return this.latestReferences;
	}

	public async createLandingPages(landingPageObjects: LandingPageCreatePayload[]): Promise<unknown[]> {
		this.createdLandingPages.push(...landingPageObjects);
		return landingPageObjects;
	}

	// Muta la lista en vez de registrar la llamada: lo que el caso de uso promete es que la próxima
	// lectura vea lo escrito, y eso es lo que el spec tiene que poder afirmar. Una referencia a algo que
	// el almacenamiento no conoce no vuelve, igual que una referencia colgada no resuelve en el content
	// lake.
	//
	// Sin el singleton **lanza**, igual que el adaptador real: `patch()` sobre un documento inexistente
	// falla en el content lake, y un doble que retornara en silencio dejaría pasar en verde a un cron que
	// en producción se cae.
	public async updateMostReadLiteraryWorks(slugs: readonly string[]): Promise<void> {
		if (!this.rotatingContent) {
			throw new RotatingContentNotFoundError();
		}
		const bySlug = new Map(
			[
				...this.literaryWorks,
				...this.rotatingContent.mostReadLiteraryWorks,
				...this.landingPages.flatMap(({ content }) => [
					...content.mostReadLiteraryWorks,
					...content.latestLiteraryWorks,
				]),
			].map((work) => [String(work.slug), work] as const),
		);
		this.rotatingContent = {
			...this.rotatingContent,
			mostReadLiteraryWorks: slugs.flatMap((slug) => bySlug.get(slug) ?? []),
		};
	}
}
