import type { SanityClient } from '@sanity/client';
import type { LandingPageContentQueryResult } from '@sanity-types';
import type { HighlightedAuthor, LandingPageContent, RotatingContent } from '@models/landing-page-content.model';
import type { LiteraryWorkNavigationTeaserWithAuthors } from '@models/literary-work.model';
import { mapAuthorTeaser, mapContentCampaigns, mapTags } from '../../_utils/functions';
import { client as sanityClient } from '../../_helpers/sanity-connector';
import {
	landingPageContentQuery,
	landingPageListQuery,
	latestLandingPageReferencesQuery,
	rotatingContentQuery,
} from '../../_queries/content.query';
import { literaryWorkTeasers } from '../../_queries/literary-work.query';
import { mapSanityCollectionTeaser } from '../collection/collection-teaser.acl';
import { mapNavigationTeaser } from '../literary-work/literary-work-navigation-teaser.acl';
import { MalformedLandingPageError, MalformedRotatingContentError } from './content.errors';
import type {
	ContentRepository,
	LandingPageCreatePayload,
	LandingPageReferences,
	LandingPageSummary,
} from './content.repository';

type SanityLandingPage = NonNullable<LandingPageContentQueryResult>;

// El documento rotativo es único por diseño, y tanto la query que lo lee como el patch que lo escribe
// lo fijan por este `_id`.
const ROTATING_CONTENT_ID = 'rotatingContent';

export class SanityContentRepository implements ContentRepository {
	constructor(private readonly client: SanityClient = sanityClient) {}

	/** Entrega el contenido curado de una semana, con su bloque de lo más leído ya resuelto. */
	public async fetchLandingPageContent(slug: string): Promise<LandingPageContent | null> {
		// Son dos documentos independientes, así que se piden en paralelo: el rotativo no depende de qué
		// semana se esté sirviendo.
		const [raw, rotating] = await Promise.all([
			this.client.fetch(landingPageContentQuery, { slug }),
			this.fetchRotatingContent(),
		]);
		if (!raw) {
			return null;
		}
		if (!rotating) {
			// Se degrada a slot vacío en vez de fallar, pero deja rastro: sin esto, el bloque de lo más
			// leído desaparece de la home con un 200 y nadie se entera.
			console.warn('SanityContentRepository: el contenido rotativo no existe; la home queda sin lo más leído');
		}
		return this.guard(slug, () => this.mapLandingPageContent(raw, rotating?.mostRead ?? []));
	}

	/** Entrega la rotación de lo más leído, o `null` si el documento no está instalado. */
	public async fetchRotatingContent(): Promise<RotatingContent | null> {
		const raw = await this.client.fetch(rotatingContentQuery);
		if (!raw) {
			// Su ausencia no es una curaduría incompleta sino una instalación incompleta, así que qué hacer
			// con ella la decide el llamador y no este adaptador.
			return null;
		}
		try {
			return {
				_id: raw._id,
				name: raw.name,
				mostRead: raw.mostReadLiteraryWorks.map((work) => mapNavigationTeaser(work)),
			};
		} catch (error) {
			throw new MalformedRotatingContentError({ cause: error });
		}
	}

	/** Dice cuáles de las semanas pedidas ya están cargadas. */
	public async fetchLandingPagesList(slugs: string[]): Promise<readonly LandingPageSummary[]> {
		const raw = await this.client.fetch(landingPageListQuery, { slugs });
		return raw.map(({ _id, slug, config }) => ({ _id, slug, config }));
	}

	/** Entrega las referencias de la última semana curada, que son la base de las semanas que se generen. */
	public async fetchLatestLandingPageReferences(currentSlug: string): Promise<LandingPageReferences | null> {
		const raw = await this.client.fetch(latestLandingPageReferencesQuery, { currentSlug });
		if (!raw) {
			return null;
		}
		// El `_id` no se copia: quien clone esto crea un documento nuevo, y arrastrarlo haría que el clon
		// pisara al original. Enumerar qué se copia sostiene además la invariante de los slots retirados
		// si alguna vez se los volviera a proyectar: las semanas ya cargadas los siguen declarando.
		return {
			_type: raw._type,
			campaigns: raw.campaigns,
			collections: raw.collections,
			latestLiteraryWorks: raw.latestLiteraryWorks,
			highlightedAuthors: raw.highlightedAuthors,
		};
	}

	public async createLandingPages(landingPageObjects: LandingPageCreatePayload[]): Promise<unknown[]> {
		return Promise.all(landingPageObjects.map((object) => this.client.create(object)));
	}

	// Resuelve los slugs con el listado de obras, que ya filtra por pertenencia: transporta el teaser
	// entero para quedarse con el identificador, y a cambio no hay una query que exista solo para esto.
	//
	// Ese filtro devuelve en orden de documento, que no tiene nada que ver con el ranking, así que el
	// resultado se reordena por el orden en que llegaron los slugs antes de escribirlo. El lote vacío no
	// consulta ni escribe.
	public async updateMostReadLiteraryWorks(slugs: readonly string[]): Promise<void> {
		if (slugs.length === 0) {
			return;
		}
		const found = await this.client.fetch(literaryWorkTeasers, { author: null, slugs: [...slugs] });
		const idBySlug = new Map(found.map(({ slug, _id }) => [slug, _id] as const));
		const references = slugs.flatMap((slug) => {
			const _id = idBySlug.get(slug);
			return _id ? [{ _key: _id, _type: 'reference' as const, _ref: _id }] : [];
		});

		await this.client.patch(ROTATING_CONTENT_ID, { set: { mostReadLiteraryWorks: references } }).commit();
	}

	/** Traduce cualquier fallo de construcción del dominio a un error que nombra la semana culpable. */
	private guard<T>(slug: string, map: () => T): T {
		try {
			return map();
		} catch (error) {
			if (error instanceof MalformedLandingPageError) {
				throw error;
			}
			// Envolver y no filtrar: una landing mal curada tumba la llamada entera en vez de servirse a
			// medias, porque un dato roto en la página de inicio es un bug que hay que ver, no esconder. El
			// slug viaja en el error porque, sobre una landing por semana, saber que "alguna" está mal no
			// alcanza para arreglarlo.
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
			latestReads: raw.latestLiteraryWorks.map((work) => mapNavigationTeaser(work)),
			highlightedAuthors: this.mapHighlightedAuthors(raw.highlightedAuthors),
		};
	}

	/** Traduce los autores que la semana destaca, con las etiquetas y el conteo que solo esta pantalla usa. */
	private mapHighlightedAuthors(raw: SanityLandingPage['highlightedAuthors']): HighlightedAuthor[] {
		return raw.map((entry) => ({
			author: mapAuthorTeaser(entry.author),
			// El teaser entrega su lista de etiquetas vacía en toda vista del repositorio, así que las del
			// destacado se mapean acá aunque salgan del mismo autor.
			tags: mapTags(entry.tags),
			storyCount: entry.storyCount,
		}));
	}
}
