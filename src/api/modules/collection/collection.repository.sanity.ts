import type { SanityClient } from '@sanity/client';
import type { CollectionBySlugQueryResult, CollectionTeasersQueryResult } from '@sanity-types';
import {
	createCollection,
	createCollectionTeaser,
	type Collection,
	type CollectionImagery,
	type CollectionTeaser,
} from '@models/collection.model';
import { createAttributedText, type AttributedText } from '@models/attributed-text.model';
import { createLiteraryWorkSection, type LiteraryWorkSection } from '@models/literary-work-section.model';
import type { LiteraryWorkTeaser } from '@models/literary-work.model';
import { createMarkdown } from '@models/markdown.model';
import { createReadingTime, deriveSectionReadingTime, type ReadingTime } from '@models/reading-time.model';
import { createSectionTitle } from '@models/section-title.model';
import { createSlug } from '@models/slug.model';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import { mapAuthorTeaser, mapTags, urlFor } from '../../_utils/functions';
import { mapMediaSources } from '../../_utils/media-sources.functions';
import { client as sanityClient } from '../../_helpers/sanity-connector';
import { collectionBySlugQuery, collectionsQuery, collectionTeasersQuery } from '../../_queries/collection.query';
import { MalformedCollectionError } from './collection.errors';
import type { CollectionRepository } from './collection.repository';

// El nombre limpio queda para el dominio: `@sanity-types` también exporta un `Collection`, que es el
// documento crudo y no el agregado.
type SanityCollection = NonNullable<CollectionBySlugQueryResult>;
type SanityCollectionWork = SanityCollection['literaryWorks'][number];
type SanityTeaserSection = SanityCollectionWork['teaserSection'][number];
type SanityEpigraph = SanityTeaserSection['epigraphs'][number];
type SanityCollectionTeaser = CollectionTeasersQueryResult[number];
type SanityFeaturedImage = SanityCollection['featuredImage'];

// Las dos vistas resuelven el abanico sobre las portadas de las mismas tres obras: es lo que la query
// del teaser dereferencia, y acotar igual del otro lado es lo que las mantiene consistentes.
const SAMPLE_COVER_COUNT = 3;

export class SanityCollectionRepository implements CollectionRepository {
	constructor(private readonly client: SanityClient = sanityClient) {}

	public async fetchBySlug(slug: string): Promise<Collection | null> {
		const raw = await this.client.fetch(collectionBySlugQuery, { slug });
		if (!raw) {
			return null;
		}
		return this.guard(raw.slug, () => this.mapCollection(raw));
	}

	public async fetchAll(): Promise<Collection[]> {
		const raw = await this.client.fetch(collectionsQuery);
		return raw.map((collection) => this.guard(collection.slug, () => this.mapCollection(collection)));
	}

	public async fetchTeasers(): Promise<CollectionTeaser[]> {
		const raw = await this.client.fetch(collectionTeasersQuery);
		return raw.map((teaser) => this.guard(teaser.slug, () => this.mapCollectionTeaser(teaser)));
	}

	// Una colección mal curada tumba la llamada entera en vez de filtrarse: un listado que esconde
	// elementos es un bug de datos que nadie ve. El slug va en el error porque, sobre decenas de
	// colecciones, saber que "algo" está mal no alcanza para arreglarlo.
	private guard<T>(slug: string, map: () => T): T {
		try {
			return map();
		} catch (error) {
			if (error instanceof MalformedCollectionError) {
				throw error;
			}
			throw new MalformedCollectionError(slug, { cause: error });
		}
	}

	// Recibe también los ítems del listado completo: las dos proyecciones son gemelas a propósito y es
	// acá donde el typecheck lo hace cumplir.
	private mapCollection(raw: SanityCollection): Collection {
		const literaryWorks = raw.literaryWorks.map((work) => this.mapLiteraryWorkTeaser(work));
		return createCollection({
			...this.mapShared(raw),
			imagery: this.resolveImagery(
				raw.slug,
				raw.featuredImage,
				// Solo las tres primeras, que es exactamente lo que la query del teaser dereferencia. Tomar
				// de todas haría que una obra sin portada en la cuarta posición se sirviera bien acá y
				// tumbara el listado de teasers: la misma colección, dos comportamientos.
				literaryWorks.slice(0, SAMPLE_COVER_COUNT).map((work) => work.coverImage),
			),
			literaryWorks,
		});
	}

	private mapCollectionTeaser(raw: SanityCollectionTeaser): CollectionTeaser {
		return createCollectionTeaser({
			...this.mapShared(raw),
			imagery: this.resolveImagery(
				raw.slug,
				raw.featuredImage,
				raw.literaryWorkCoverImages.map((cover) => (cover ? urlFor(cover) : '')),
			),
			// Cero cuando la colección no tiene obras, que es el caso que la factory rechaza.
			count: raw.count,
		});
	}

	// Lo que las dos vistas mapean igual. La descripción va sin default: el vacío tiene que lanzar y
	// quedar envuelto, no colarse como una colección sin prosa.
	private mapShared(raw: SanityCollection | SanityCollectionTeaser) {
		return {
			_id: raw._id,
			slug: raw.slug,
			title: raw.title,
			description: markdownToSanitizedHtml(createMarkdown(raw.description)),
			tags: mapTags(raw.tags),
			config: { showAuthors: raw.config.showAuthors },
			mediaSources: mapMediaSources(raw.mediaSources),
		};
	}

	// Duplica deliberadamente lo que `_utils/storylist-imagery.functions.ts` resuelve para Storylist:
	// aquel devuelve un tipo nominal distinto, su abanico sale de portadas de Story, y acá un abanico
	// incompleto lanza en vez de rellenarse con cadenas vacías, que es lo que colaba portadas rotas.
	//
	// Las dos vistas le pasan las portadas de las **mismas tres** obras, para que una colección no pueda
	// construirse por un camino y fallar por el otro.
	private resolveImagery(slug: string, featuredImage: SanityFeaturedImage, coverUrls: string[]): CollectionImagery {
		const image = featuredImage ? urlFor(featuredImage) : '';
		if (image !== '') {
			return { kind: 'representative', image };
		}
		const [first, second, third] = coverUrls.filter((url) => url !== '');
		if (first === undefined || second === undefined || third === undefined) {
			throw new MalformedCollectionError(slug);
		}
		return { kind: 'sample', images: [first, second, third] };
	}

	private mapLiteraryWorkTeaser(raw: SanityCollectionWork): LiteraryWorkTeaser {
		const [teaserSection] = raw.teaserSection;
		if (!teaserSection) {
			// Sin sección de apertura el teaser es inconstruible: es la contracara de la invariante
			// "al menos una sección" que la obra ya hace cumplir.
			throw new MalformedCollectionError(raw.slug);
		}
		return {
			_id: raw._id,
			slug: createSlug(raw.slug),
			title: raw.title,
			coverImage: raw.coverImage ? urlFor(raw.coverImage) : '',
			// En publicado el total siempre viene; la otra rama cubre el opcional del tipo, que solo se da
			// en borradores, y ahí cae al tiempo de la sección de apertura —una cota inferior para una obra
			// multi-sección—.
			totalReadingTime:
				raw.totalReadingTime !== null
					? createReadingTime(raw.totalReadingTime)
					: this.sectionReadingTime(teaserSection),
			sectionCount: raw.sectionCount,
			tags: mapTags(raw.tags),
			mediaSources: mapMediaSources(raw.mediaSources),
			authors: raw.authors.map(mapAuthorTeaser),
			teaserSection: this.mapTeaserSection(teaserSection),
		};
	}

	private mapTeaserSection(raw: SanityTeaserSection): LiteraryWorkSection {
		return createLiteraryWorkSection({
			position: 0,
			title: raw.title ? createSectionTitle(raw.title) : undefined,
			epigraphs: raw.epigraphs.map((epigraph) => this.mapEpigraph(epigraph)),
			bodyHtml: markdownToSanitizedHtml(createMarkdown(raw.body)),
			readingTime: this.sectionReadingTime(raw),
		});
	}

	// El persistido gana al derivado: el derivado es una estimación del cuerpo y el otro es el dato.
	private sectionReadingTime(raw: SanityTeaserSection): ReadingTime {
		return raw.readingTime !== null
			? createReadingTime(raw.readingTime)
			: deriveSectionReadingTime(createMarkdown(raw.body));
	}

	private mapEpigraph(raw: SanityEpigraph): AttributedText {
		return createAttributedText({
			text: markdownToSanitizedHtml(createMarkdown(raw.text ?? '')),
			reference: raw.reference ? markdownToSanitizedHtml(createMarkdown(raw.reference)) : undefined,
		});
	}
}
