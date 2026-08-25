import type { SanityClient } from '@sanity/client';
import type {
	LandingPageContentQueryResult,
	LandingPageListQueryResult,
	LatestLandingPageReferencesQueryResult,
	RotatingContentQueryResult,
} from '@sanity-types';
import type { HighlightedAuthor, LandingPageContent, RotatingContent } from '@models/landing-page-content.model';
import type { LiteraryWorkNavigationTeaserWithAuthors } from '@models/literary-work.model';
import { createReadingTime } from '@models/reading-time.model';
import { createSlug } from '@models/slug.model';
import { mapAuthorTeaser, mapContentCampaigns, mapTags, urlFor } from '../../_utils/functions';
import { mapMediaTeasers } from '../../_utils/media-sources.functions';
import { client as sanityClient } from '../../_helpers/sanity-connector';
import {
	landingPageContentQuery,
	landingPageListQuery,
	latestLandingPageReferencesQuery,
	rotatingContentQuery,
} from '../../_queries/content.query';
import { mapSanityCollectionTeaser } from '../collection/collection-teaser.acl';
import { MalformedLandingPageError } from './content.errors';
import type { ContentRepository, KeyedReference, LandingPageCreatePayload } from './content.repository';

type SanityLandingPage = NonNullable<LandingPageContentQueryResult>;
type SanityRotatingContent = NonNullable<RotatingContentQueryResult>;
// La misma vista de obra la proyectan la landing y el contenido rotativo: el mapper se tipa contra la
// unión para que ninguna de las dos pueda divergir sin que el typecheck lo denuncie.
type SanityNavigationTeaser =
	SanityLandingPage['latestLiteraryWorks'][number] | SanityRotatingContent['mostReadLiteraryWorks'][number];

// El documento rotativo es único por diseño y la query lo fija por `_id`, así que su ausencia no es
// un slug que no existe sino una instalación incompleta.
const ROTATING_CONTENT_SLUG = 'rotatingContent';

export class SanityContentRepository implements ContentRepository {
	constructor(private readonly client: SanityClient = sanityClient) {}

	public async fetchLandingPageContent(slug: string): Promise<LandingPageContent | null> {
		const [raw, rotating] = await Promise.all([
			this.client.fetch(landingPageContentQuery, { slug }),
			this.fetchRotatingContent(),
		]);
		if (!raw) {
			return null;
		}
		return this.guard(slug, () => this.mapLandingPageContent(raw, rotating?.mostRead ?? []));
	}

	public async fetchRotatingContent(): Promise<RotatingContent | null> {
		const raw = await this.client.fetch(rotatingContentQuery);
		if (!raw) {
			return null;
		}
		return this.guard(ROTATING_CONTENT_SLUG, () => ({
			_id: raw._id,
			name: raw.name,
			mostRead: raw.mostReadLiteraryWorks.map((work) => this.mapNavigationTeaser(work)),
		}));
	}

	public async fetchLandingPagesList(slugs: string[]): Promise<LandingPageListQueryResult> {
		return this.client.fetch(landingPageListQuery, { slugs });
	}

	public async fetchLatestLandingPageReferences(currentSlug: string): Promise<LatestLandingPageReferencesQueryResult> {
		return this.client.fetch(latestLandingPageReferencesQuery, { currentSlug });
	}

	public async createLandingPages(landingPageObjects: LandingPageCreatePayload[]): Promise<unknown[]> {
		return Promise.all(landingPageObjects.map((object) => this.client.create(object)));
	}

	public async updateMostReadLiteraryWorks(references: readonly KeyedReference[]): Promise<void> {
		await this.client.patch(ROTATING_CONTENT_SLUG, { set: { mostReadLiteraryWorks: [...references] } }).commit();
	}

	// Una landing mal curada tumba la llamada entera en vez de servirse a medias: una portada rota o una
	// colección vacía en la página de inicio es un bug de datos que hay que ver, no esconder. El slug va
	// en el error porque, sobre una landing por semana, saber que "alguna" está mal no alcanza.
	private guard<T>(slug: string, map: () => T): T {
		try {
			return map();
		} catch (error) {
			if (error instanceof MalformedLandingPageError) {
				throw error;
			}
			throw new MalformedLandingPageError(slug, { cause: error });
		}
	}

	private mapLandingPageContent(
		raw: SanityLandingPage,
		mostRead: readonly LiteraryWorkNavigationTeaserWithAuthors[],
	): LandingPageContent {
		return {
			_id: raw._id,
			config: raw.config,
			collections: raw.collections.map(mapSanityCollectionTeaser),
			campaigns: mapContentCampaigns(raw.campaigns),
			mostRead,
			latestReads: raw.latestLiteraryWorks.map((work) => this.mapNavigationTeaser(work)),
			highlightedAuthors: this.mapHighlightedAuthors(raw.highlightedAuthors),
		};
	}

	// Este repository es el primer y único productor backend de la vista de navegación con autores: la
	// pintan las tarjetas de la página de inicio, que no muestran cuerpo y por eso no piden extracto.
	private mapNavigationTeaser(raw: SanityNavigationTeaser): LiteraryWorkNavigationTeaserWithAuthors {
		if (raw.totalReadingTime === null) {
			// Sin el total no hay nada que mostrar en la tarjeta: es una obra a la que el backfill todavía
			// no le calculó su tiempo de lectura.
			throw new MalformedLandingPageError(raw.slug);
		}
		return Object.freeze({
			_id: raw._id,
			slug: createSlug(raw.slug),
			title: raw.title,
			coverImage: raw.coverImage ? urlFor(raw.coverImage) : '',
			totalReadingTime: createReadingTime(raw.totalReadingTime),
			sectionCount: raw.sectionCount,
			tags: mapTags(raw.tags),
			mediaSources: mapMediaTeasers(raw.mediaSources),
			authors: raw.authors.map(mapAuthorTeaser),
		});
	}

	private mapHighlightedAuthors(raw: SanityLandingPage['highlightedAuthors']): HighlightedAuthor[] {
		// El Studio limita la carga a seis entradas, pero esa regla gobierna la edición y no lo ya guardado:
		// una migración o un backfill pueden dejar más. El recorte acá es una salvaguarda, no la regla.
		const limit = 6;

		return raw.slice(0, limit).map((entry) => ({
			author: mapAuthorTeaser(entry.author),
			// El teaser entrega su lista vacía en toda vista del repositorio, así que las etiquetas del
			// destacado se mapean acá aunque salgan del mismo autor.
			tags: mapTags(entry.tags),
			storyCount: entry.storyCount,
		}));
	}
}
