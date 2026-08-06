import type { SanityClient } from '@sanity/client';
import type { CollectionBySlugQueryResult, CollectionsQueryResult } from '@sanity-types';
import {
	createCollection,
	createCollectionTeaser,
	type Collection,
	type CollectionImagery,
	type CollectionTeaser,
} from '@models/collection.model';
import { createLiteraryWorkSection, type LiteraryWorkSection } from '@models/literary-work-section.model';
import type { LiteraryWorkTeaser } from '@models/literary-work.model';
import { createMarkdown } from '@models/markdown.model';
import { createReadingTime, deriveSectionReadingTime } from '@models/reading-time.model';
import { createSectionTitle } from '@models/section-title.model';
import { createSlug } from '@models/slug.model';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import { mapAuthorTeaser, mapTags, urlFor } from '../../_utils/functions';
import { mapMediaSources } from '../../_utils/media-sources.functions';
import { client as sanityClient } from '../../_helpers/sanity-connector';
import { collectionBySlugQuery, collectionsQuery } from '../../_queries/collection.query';
import { MalformedCollectionError } from './collection.errors';
import type { CollectionRepository } from './collection.repository';

// El nombre limpio queda para el dominio: `@sanity-types` también exporta un `Collection`, que es el
// documento crudo y no el agregado.
type SanityCollection = NonNullable<CollectionBySlugQueryResult>;
type SanityCollectionWork = SanityCollection['literaryWorks'][number];
type SanityTeaserSection = SanityCollectionWork['teaserSection'][number];
type SanityCollectionTeaser = CollectionsQueryResult[number];
type SanityFeaturedImage = SanityCollection['featuredImage'];

export class SanityCollectionRepository implements CollectionRepository {
	constructor(private readonly client: SanityClient = sanityClient) {}

	public async fetchBySlug(slug: string): Promise<Collection | null> {
		const raw = await this.client.fetch(collectionBySlugQuery, { slug });
		if (!raw) {
			return null;
		}
		return this.guard(raw.slug, () => this.mapCollection(raw));
	}

	public async fetchAll(): Promise<CollectionTeaser[]> {
		const raw = await this.client.fetch(collectionsQuery);
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

	private mapCollection(raw: SanityCollection): Collection {
		// Solo las tres primeras, que es exactamente lo que la query del catálogo dereferencia. Tomar de
		// todas haría que una obra sin portada en la cuarta posición se sirviera bien acá y tumbara el
		// catálogo entero: la misma colección, dos comportamientos.
		const sampleCoverCount = 3;
		const literaryWorks = raw.literaryWorks.map((work) => this.mapLiteraryWorkTeaser(work));
		return createCollection({
			...this.mapShared(raw),
			imagery: this.resolveImagery(
				raw.slug,
				raw.featuredImage,
				literaryWorks.slice(0, sampleCoverCount).map((work) => work.coverImage),
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

	// Las dos vistas le pasan las portadas de las **mismas tres** obras, para que una colección no pueda
	// construirse por un camino y fallar por el otro. Un abanico incompleto lanza en vez de rellenarse:
	// una portada vacía llega a la interfaz como una imagen rota.
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
		const section = this.mapTeaserSection(teaserSection);
		// Se congela como el agregado que lo contiene: el teaser no tiene factory propia —la vista de
		// obra no la necesitó hasta ahora—, pero eso no es razón para que sea el único objeto mutable
		// dentro de una colección congelada.
		return Object.freeze({
			_id: raw._id,
			slug: createSlug(raw.slug),
			title: raw.title,
			coverImage: raw.coverImage ? urlFor(raw.coverImage) : '',
			// En publicado el total siempre viene; la otra rama cubre el opcional del tipo, que solo se da
			// en borradores, y ahí cae al tiempo de la sección de apertura —una cota inferior para una obra
			// multi-sección—.
			totalReadingTime: raw.totalReadingTime !== null ? createReadingTime(raw.totalReadingTime) : section.readingTime,
			sectionCount: raw.sectionCount,
			tags: mapTags(raw.tags),
			mediaSources: mapMediaSources(raw.mediaSources),
			authors: raw.authors.map(mapAuthorTeaser),
			teaserSection: section,
		});
	}

	// Sin epígrafes: la tarjeta que consume el teaser muestra el cuerpo y nadie más los lee, así que la
	// query tampoco los trae. El campo es opcional en la sección, no un vacío que haya que rellenar.
	private mapTeaserSection(raw: SanityTeaserSection): LiteraryWorkSection {
		return createLiteraryWorkSection({
			position: 0,
			title: raw.title ? createSectionTitle(raw.title) : undefined,
			bodyHtml: markdownToSanitizedHtml(createMarkdown(raw.body)),
			readingTime:
				raw.readingTime !== null
					? createReadingTime(raw.readingTime)
					: deriveSectionReadingTime(createMarkdown(raw.body)),
		});
	}
}
