import type { SanityClient } from '@sanity/client';
import type {
	LandingPageContentQueryResult,
	RotatingContentQueryResult,
	StorylistTeasersQueryResult,
} from '@sanity-types';
import type { HighlightedAuthor, LandingPageContent, RotatingContent } from '@models/landing-page-content.model';
import type { StorylistTeaser } from '@models/storylist.model';
import type { StoryNavigationTeaserWithAuthor } from '@models/story.model';
import {
	mapAuthorTeaser,
	mapBlockContentToTextParagraphs,
	mapContentCampaigns,
	mapResources,
	mapTags,
	urlFor,
} from '../../_utils/functions';
import { mapMediaSources } from '../../_utils/media-sources.functions';
import { mapImagery } from '../../_utils/storylist-imagery.functions';
import { client as sanityClient } from '../../_helpers/sanity-connector';
import {
	landingPageContentQuery,
	landingPageListQuery,
	latestLandingPageReferencesQuery,
	rotatingContentQuery,
} from '../../_queries/content.query';
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
			return { _id: raw._id, name: raw.name, mostRead: this.mapNavigationTeasers(raw.mostRead) };
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
		// pisara al original.
		return {
			_type: raw._type,
			campaigns: raw.campaigns,
			cards: raw.cards,
			latestReads: raw.latestReads,
			highlightedAuthors: raw.highlightedAuthors,
		};
	}

	public async createLandingPages(landingPageObjects: LandingPageCreatePayload[]): Promise<unknown[]> {
		return Promise.all(landingPageObjects.map((object) => this.client.create(object)));
	}

	public async updateMostReadStories(references: readonly KeyedReference[]): Promise<void> {
		await this.client.patch(ROTATING_CONTENT_ID, { set: { mostRead: [...references] } }).commit();
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
		mostRead: StoryNavigationTeaserWithAuthor[],
	): LandingPageContent {
		return {
			_id: raw._id,
			config: raw.config,
			cards: this.mapStorylistTeasers(raw.cards),
			campaigns: mapContentCampaigns(raw.campaigns),
			mostRead,
			latestReads: this.mapNavigationTeasers(raw.latestReads),
			highlightedAuthors: this.mapHighlightedAuthors(raw.highlightedAuthors),
		};
	}

	private mapStorylistTeasers(result: StorylistTeasersQueryResult): StorylistTeaser[] {
		return result.map((item) => {
			const { featuredImage, storyCoverImages, mediaSources, ...rest } = item;
			return {
				...rest,
				config: { ...item.config, showAuthors: item.config?.showAuthors ?? false },
				description: mapBlockContentToTextParagraphs(item.description),
				tags: mapTags(item.tags),
				stories: [],
				tabs: [],
				media: mapMediaSources(mediaSources),
				imagery: mapImagery({ featuredImage, storyCoverImages }),
			};
		});
	}

	/**
	 * Traduce la vista de navegación que comparten los dos slots de destacados.
	 *
	 * El tipo de entrada es la unión de las dos proyecciones que la producen —la de la landing y la del
	 * contenido rotativo— para que ninguna pueda divergir sin que el typecheck lo denuncie.
	 */
	private mapNavigationTeasers(
		result: SanityLandingPage['latestReads'] | SanityRotatingContent['mostRead'],
	): StoryNavigationTeaserWithAuthor[] {
		return result.map((item) => {
			const { mediaSources, resources, coverImage, ...properties } = item;
			return {
				...properties,
				author: mapAuthorTeaser(item.author),
				coverImage: urlFor(coverImage),
				media: mapMediaSources(mediaSources),
				resources: mapResources(resources),
				paragraphs: [],
				tags: [],
			};
		});
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
