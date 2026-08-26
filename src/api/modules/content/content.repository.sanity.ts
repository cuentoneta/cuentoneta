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

	// La landing se arma con dos documentos: el de la semana y el rotativo, que aporta lo más leído y es
	// independiente de ella.
	public async fetchLandingPageContent(slug: string): Promise<LandingPageContent | null> {
		const [raw, rotating] = await Promise.all([
			this.client.fetch(landingPageContentQuery, { slug }),
			this.fetchRotatingContent(),
		]);
		if (!raw) {
			return null;
		}
		if (!rotating) {
			// La landing se sigue sirviendo con el slot vacío, pero la degradación tiene que dejar rastro:
			// sin esto, el bloque de lo más leído desaparece de la home con un 200 y nadie se entera.
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
			return { _id: raw._id, name: raw.name, mostRead: this.mapNavigationTeasers(raw.mostRead) };
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
			highlightedAuthors: raw.highlightedAuthors,
		};
	}

	public async createLandingPages(landingPageObjects: LandingPageCreatePayload[]): Promise<unknown[]> {
		return Promise.all(landingPageObjects.map((object) => this.client.create(object)));
	}

	public async updateMostReadStories(references: readonly KeyedReference[]): Promise<void> {
		await this.client.patch(ROTATING_CONTENT_ID, { set: { mostRead: [...references] } }).commit();
	}

	// Una landing mal curada tumba la llamada entera en vez de servirse a medias: un dato roto en la
	// página de inicio es un bug que hay que ver, no esconder. El slug va en el error porque, sobre una
	// landing por semana, saber que "alguna" está mal no alcanza para arreglarlo.
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

	// La misma vista la proyectan la landing y el contenido rotativo: el mapeo se tipa contra la unión
	// para que ninguna de las dos pueda divergir sin que el typecheck lo denuncie.
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
