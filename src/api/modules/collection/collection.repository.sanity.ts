import type { SanityClient } from '@sanity/client';
import type { CollectionBySlugQueryResult } from '@sanity-types';
import { createCollection, type Collection, type CollectionTeaser } from '@models/collection.model';
import { createLiteraryWorkExcerpt, type LiteraryWorkExcerpt } from '@models/literary-work-excerpt.model';
import type { LiteraryWorkTeaser } from '@models/literary-work.model';
import { createMarkdown } from '@models/markdown.model';
import { createReadingTime, type ReadingTime } from '@models/reading-time.model';
import { createSectionTitle } from '@models/section-title.model';
import { createSlug } from '@models/slug.model';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import { mapAuthorTeaser, mapTags, urlFor } from '../../_utils/functions';
import { mapMediaTeasers } from '../../_utils/media-sources.functions';
import { client as sanityClient } from '../../_helpers/sanity-connector';
import { collectionBySlugQuery, collectionsQuery } from '../../_queries/collection.query';
import {
	mapSanityCollectionTeaser,
	mapSharedCollectionFields,
	resolveCollectionImagery,
} from './collection-teaser.acl';
import { MalformedCollectionError } from './collection.errors';
import type { CollectionRepository, CollectionTeaserListing } from './collection.repository';

// El nombre limpio queda para el dominio: `@sanity-types` también exporta un `Collection`, que es el
// documento crudo y no el agregado.
type SanityCollection = NonNullable<CollectionBySlugQueryResult>;
type SanityCollectionWork = SanityCollection['literaryWorks'][number];
type SanityExcerpt = SanityCollectionWork['excerpt'][number];

export class SanityCollectionRepository implements CollectionRepository {
	constructor(private readonly client: SanityClient = sanityClient) {}

	public async fetchBySlug(slug: string): Promise<Collection | null> {
		const raw = await this.client.fetch(collectionBySlugQuery, { slug });
		if (!raw) {
			return null;
		}
		try {
			return this.mapCollection(raw);
		} catch (error) {
			throw this.asMalformed(raw.slug, error);
		}
	}

	public async fetchAll(): Promise<CollectionTeaserListing> {
		const raw = await this.client.fetch(collectionsQuery);

		const collections: CollectionTeaser[] = [];
		const malformed: MalformedCollectionError[] = [];
		for (const rawTeaser of raw) {
			try {
				collections.push(mapSanityCollectionTeaser(rawTeaser));
			} catch (error) {
				// Se acumula en vez de propagarse: si una colección rota se descarta del listado o lo
				// tumba es una política del caso de uso, no de este adaptador.
				malformed.push(this.asMalformed(rawTeaser.slug, error));
			}
		}
		return { collections, malformed };
	}

	// El slug va en el error porque, sobre decenas de colecciones, saber que "algo" está mal no alcanza
	// para arreglarlo.
	private asMalformed(slug: string, error: unknown): MalformedCollectionError {
		return error instanceof MalformedCollectionError ? error : new MalformedCollectionError(slug, { cause: error });
	}

	private mapCollection(raw: SanityCollection): Collection {
		// Solo las tres primeras, que es exactamente lo que la query del catálogo dereferencia. Tomar de
		// todas haría que una obra sin portada en la cuarta posición se sirviera bien acá y tumbara el
		// catálogo entero: la misma colección, dos comportamientos.
		const sampleCoverCount = 3;
		const literaryWorks = raw.literaryWorks.map((work) => this.mapLiteraryWorkTeaser(work));
		return createCollection({
			...mapSharedCollectionFields(raw, markdownToSanitizedHtml),
			imagery: resolveCollectionImagery(
				raw.slug,
				raw.featuredImage,
				literaryWorks.slice(0, sampleCoverCount).map((work) => work.coverImage),
			),
			literaryWorks,
		});
	}

	private mapLiteraryWorkTeaser(raw: SanityCollectionWork): LiteraryWorkTeaser {
		const [rawExcerpt] = raw.excerpt;
		if (!rawExcerpt) {
			// Sin sección de apertura el teaser es inconstruible: es la contracara de la invariante
			// "al menos una sección" que la obra ya hace cumplir.
			throw new MalformedCollectionError(raw.slug);
		}
		// Se congela como el agregado que lo contiene: el teaser no tiene factory propia —la vista de
		// obra no la necesitó hasta ahora—, pero eso no es razón para que sea el único objeto mutable
		// dentro de una colección congelada.
		return Object.freeze({
			_id: raw._id,
			slug: createSlug(raw.slug),
			title: raw.title,
			coverImage: raw.coverImage ? urlFor(raw.coverImage) : '',
			totalReadingTime: this.resolveTotalReadingTime(raw),
			sectionCount: raw.sectionCount,
			tags: mapTags(raw.tags),
			mediaSources: mapMediaTeasers(raw.mediaSources),
			authors: raw.authors.map(mapAuthorTeaser),
			excerpt: this.mapExcerpt(raw.slug, rawExcerpt),
		});
	}

	// No hay derivación que sirva: en una obra de texto el total es la suma de sus secciones, pero en
	// una obra recitada es la duración del medio. Cualquier cálculo acierta en una y falla en la otra.
	private resolveTotalReadingTime(raw: SanityCollectionWork): ReadingTime {
		if (raw.totalReadingTime === null) {
			throw new MalformedCollectionError(raw.slug);
		}
		return createReadingTime(raw.totalReadingTime);
	}

	// `body` llega nullable porque el recorte es un `split` indexado y el typegen no puede descartar el
	// índice fuera de rango. Rellenarlo con vacío dejaría un hueco mudo en la tarjeta.
	private mapExcerpt(slug: string, raw: SanityExcerpt): LiteraryWorkExcerpt {
		if (raw.body === null) {
			throw new MalformedCollectionError(slug);
		}
		return createLiteraryWorkExcerpt({
			title: raw.title ? createSectionTitle(raw.title) : undefined,
			bodyHtml: markdownToSanitizedHtml(createMarkdown(raw.body)),
		});
	}
}
