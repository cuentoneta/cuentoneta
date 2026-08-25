import type { SanityClient } from '@sanity/client';
import type { LandingPageContentQueryResult, RotatingContentQueryResult } from '@sanity-types';
import type { HighlightedAuthor, LandingPageContent, RotatingContent } from '@models/landing-page-content.model';
import {
	createLiteraryWorkNavigationTeaser,
	type LiteraryWorkNavigationTeaserWithAuthors,
} from '@models/literary-work.model';
import { createReadingTime } from '@models/reading-time.model';
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
import { MalformedLandingPageError, MalformedRotatingContentError } from './content.errors';
import type {
	ContentRepository,
	KeyedReference,
	LandingPageCreatePayload,
	LandingPageReferences,
	LandingPageSummary,
} from './content.repository';

type SanityLandingPage = NonNullable<LandingPageContentQueryResult>;
type SanityRotatingContent = NonNullable<RotatingContentQueryResult>;
// La misma vista de obra la proyectan la landing y el contenido rotativo: el mapper se tipa contra la
// unión para que ninguna de las dos pueda divergir sin que el typecheck lo denuncie.
type SanityNavigationTeaser =
	SanityLandingPage['latestLiteraryWorks'][number] | SanityRotatingContent['mostReadLiteraryWorks'][number];

// El documento rotativo es único por diseño, y tanto la query que lo lee como el patch que lo escribe
// lo fijan por este `_id`.
const ROTATING_CONTENT_ID = 'rotatingContent';

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
		if (!rotating) {
			// La landing se sigue sirviendo con el slot vacío —el documento rotativo es independiente de la
			// semana—, pero la degradación tiene que dejar rastro: sin esto, el bloque de lo más leído
			// desaparece de la home con un 200 y nadie se entera.
			console.warn('SanityContentRepository: el contenido rotativo no existe; la home queda sin lo más leído');
		}
		return this.guard(slug, () => this.mapLandingPageContent(raw, rotating?.mostRead ?? []));
	}

	// Su ausencia no es una curaduría incompleta sino una instalación incompleta, y el llamador decide
	// qué hacer con eso: la landing se sigue sirviendo con el slot vacío.
	public async fetchRotatingContent(): Promise<RotatingContent | null> {
		const raw = await this.client.fetch(rotatingContentQuery);
		if (!raw) {
			return null;
		}
		try {
			return {
				_id: raw._id,
				name: raw.name,
				mostRead: raw.mostReadLiteraryWorks.map((work) => this.mapNavigationTeaser(work)),
			};
		} catch (error) {
			throw new MalformedRotatingContentError({ cause: error });
		}
	}

	public async fetchLandingPagesList(slugs: string[]): Promise<readonly LandingPageSummary[]> {
		const raw = await this.client.fetch(landingPageListQuery, { slugs });
		return raw.map(({ _id, slug, config }) => ({ _id, slug, config }));
	}

	// El `_id` se descarta acá y no en el service: la semana nueva es un documento nuevo, y arrastrarlo
	// haría que el clon pisara al original.
	public async fetchLatestLandingPageReferences(currentSlug: string): Promise<LandingPageReferences | null> {
		const raw = await this.client.fetch(latestLandingPageReferencesQuery, { currentSlug });
		if (!raw) {
			return null;
		}
		return {
			_type: raw._type,
			campaigns: raw.campaigns,
			cards: raw.cards,
			latestReads: raw.latestReads,
			collections: raw.collections,
			latestLiteraryWorks: raw.latestLiteraryWorks,
			highlightedAuthors: raw.highlightedAuthors,
		};
	}

	public async createLandingPages(landingPageObjects: LandingPageCreatePayload[]): Promise<unknown[]> {
		return Promise.all(landingPageObjects.map((object) => this.client.create(object)));
	}

	public async updateMostReadLiteraryWorks(references: readonly KeyedReference[]): Promise<void> {
		await this.client.patch(ROTATING_CONTENT_ID, { set: { mostReadLiteraryWorks: [...references] } }).commit();
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
	//
	// El error que sale de acá nombra la **obra**, y es el guard de arriba el que lo envuelve nombrando
	// la semana: sin esa distinción, el mensaje culparía a la landing por una obra mal curada que puede
	// estar en cualquiera de las dos listas, o en el documento rotativo, que ni siquiera es una landing.
	private mapNavigationTeaser(raw: SanityNavigationTeaser): LiteraryWorkNavigationTeaserWithAuthors {
		if (raw.totalReadingTime === null) {
			// Sin el total no hay nada que mostrar en la tarjeta: es una obra a la que el backfill todavía
			// no le calculó su tiempo de lectura.
			throw new Error(`LiteraryWorkNavigationTeaser inválido: sin tiempo de lectura (slug "${raw.slug}")`);
		}
		return createLiteraryWorkNavigationTeaser({
			_id: raw._id,
			slug: raw.slug,
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
