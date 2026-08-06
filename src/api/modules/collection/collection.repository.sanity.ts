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
import { createReadingTime, deriveSectionReadingTime } from '@models/reading-time.model';
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
				literaryWorks.map((work) => work.coverImage),
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
			// `count` es null cuando la colección no tiene el array: es el mismo caso que "sin obras", y
			// la factory lo rechaza igual.
			count: raw.count ?? 0,
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
	private resolveImagery(slug: string, featuredImage: unknown, coverUrls: string[]): CollectionImagery {
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
			// En publicado el total siempre viene; la otra rama cubre el opcional del tipo, que solo se
			// da en borradores, donde para una obra multi-sección da una cota inferior.
			totalReadingTime:
				raw.totalReadingTime !== null
					? createReadingTime(raw.totalReadingTime)
					: deriveSectionReadingTime(createMarkdown(teaserSection.body)),
			sectionCount: raw.sectionCount,
			tags: mapTags(raw.tags),
			mediaSources: mapMediaSources(raw.mediaSources),
			authors: raw.authors.map(mapAuthorTeaser),
			teaserSection: this.mapTeaserSection(teaserSection),
		};
	}

	private mapTeaserSection(raw: SanityTeaserSection): LiteraryWorkSection {
		const body = createMarkdown(raw.body);
		return createLiteraryWorkSection({
			position: 0,
			title: raw.title ? createSectionTitle(raw.title) : undefined,
			epigraphs: raw.epigraphs.map((epigraph) => this.mapEpigraph(epigraph)),
			bodyHtml: markdownToSanitizedHtml(body),
			readingTime: raw.readingTime !== null ? createReadingTime(raw.readingTime) : deriveSectionReadingTime(body),
		});
	}

	private mapEpigraph(raw: SanityEpigraph): AttributedText {
		return createAttributedText({
			text: markdownToSanitizedHtml(createMarkdown(raw.text ?? '')),
			reference: raw.reference ? markdownToSanitizedHtml(createMarkdown(raw.reference)) : undefined,
		});
	}
}
