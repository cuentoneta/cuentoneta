import type { SanityClient } from '@sanity/client';
import type { LiteraryWorkBySlugQueryResult, LiteraryWorkTeasersResult } from '@sanity-types';
import { createLiteraryWork, type LiteraryWork, type LiteraryWorkTeaser } from '@models/literary-work.model';
import { createAttributedText, type AttributedText } from '@models/attributed-text.model';
import { createLiteraryWorkExcerpt, type LiteraryWorkExcerpt } from '@models/literary-work-excerpt.model';
import { createLiteraryWorkSection, type LiteraryWorkSection } from '@models/literary-work-section.model';
import { createSectionTitle } from '@models/section-title.model';
import { createMarkdown } from '@models/markdown.model';
import { createReadingTime, deriveSectionReadingTime, type ReadingTime } from '@models/reading-time.model';
import { createSlug } from '@models/slug.model';
import { createIsoDateTime } from '@utils/date.utils';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import { mapAuthor, mapAuthorTeaser, mapResources, mapTags, urlFor } from '../../_utils/functions';
import { mapMediaSources, mapMediaTeasers } from '../../_utils/media-sources.functions';
import { client as sanityClient } from '../../_helpers/sanity-connector';
import { literaryWorkBySlugQuery, literaryWorkTeasers } from '../../_queries/literary-work.query';
import { MalformedLiteraryWorkError } from './literary-work.errors';
import type {
	LiteraryWorkRepository,
	LiteraryWorkTeaserFilter,
	LiteraryWorkTeaserListing,
} from './literary-work.repository';

type SanityLiteraryWork = NonNullable<LiteraryWorkBySlugQueryResult>;
type SanityLiteraryWorkSection = SanityLiteraryWork['content'][number];
type SanityEpigraph = NonNullable<SanityLiteraryWorkSection['epigraphs']>[number];
type SanityLiteraryWorkMetadata = Omit<SanityLiteraryWork, 'content'>;
type SanityLiteraryWorkTeaser = LiteraryWorkTeasersResult[number];
type SanityTeaserExcerpt = SanityLiteraryWorkTeaser['excerpt'][number];

export class SanityLiteraryWorkRepository implements LiteraryWorkRepository {
	constructor(private readonly client: SanityClient = sanityClient) {}

	public async fetchBySlug(slug: string): Promise<LiteraryWork | null> {
		const raw = await this.client.fetch(literaryWorkBySlugQuery, { slug });
		if (!raw) {
			return null;
		}
		return this.mapLiteraryWork(raw);
	}

	// Trae el catálogo de obras que satisfacen el filtro, traducidas a la vista de teaser.
	public async fetchTeasers(filter: LiteraryWorkTeaserFilter): Promise<LiteraryWorkTeaserListing> {
		const raw = await this.client.fetch(literaryWorkTeasers, { author: filter.author ?? null });

		const literaryWorks: LiteraryWorkTeaser[] = [];
		const malformed: MalformedLiteraryWorkError[] = [];
		for (const rawTeaser of raw) {
			try {
				literaryWorks.push(this.mapLiteraryWorkTeaser(rawTeaser));
			} catch (error) {
				// El mapeo por obra no se ablanda: la intraducible se acumula en vez de propagarse,
				// porque qué hacer con ella —descartarla de un listado, tumbar el agregado que la
				// cura— lo decide quien conoce el caso de uso, no este adaptador. El slug viaja en el
				// error porque, sobre el catálogo entero, saber que "algo" está mal no alcanza para
				// arreglarlo.
				malformed.push(
					error instanceof MalformedLiteraryWorkError
						? error
						: new MalformedLiteraryWorkError(rawTeaser.slug, { cause: error }),
				);
			}
		}
		return { literaryWorks, malformed };
	}

	private mapLiteraryWorkTeaser(raw: SanityLiteraryWorkTeaser): LiteraryWorkTeaser {
		const [rawExcerpt] = raw.excerpt;
		if (!rawExcerpt) {
			// Sin sección de apertura el teaser es inconstruible: es la contracara de la invariante
			// "al menos una sección" que la obra ya hace cumplir.
			throw new MalformedLiteraryWorkError(raw.slug);
		}
		// Se congela como los agregados que lo transportan: el teaser no tiene factory propia, pero eso
		// no es razón para que sea el único objeto mutable del listado.
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

	// El tiempo total de lectura de la obra, tal como lo persiste el CMS.
	private resolveTotalReadingTime(raw: SanityLiteraryWorkTeaser): ReadingTime {
		// Ausente, la obra es intraducible: no hay derivación que sirva de reemplazo, porque en una
		// obra de texto el total es la suma de sus secciones y en una recitada es la duración del
		// medio. Cualquier cálculo acierta en una y falla en la otra.
		if (raw.totalReadingTime === null) {
			throw new MalformedLiteraryWorkError(raw.slug);
		}
		return createReadingTime(raw.totalReadingTime);
	}

	// El extracto que la tarjeta pinta bajo el título: el arranque de la sección de apertura, ya
	// saneado. El slug es para el error, porque el extracto no lo transporta.
	private mapExcerpt(slug: string, raw: SanityTeaserExcerpt): LiteraryWorkExcerpt {
		// Nullable porque el recorte es un `split` indexado y el typegen no puede descartar el índice
		// fuera de rango. Rellenarlo con vacío dejaría un hueco mudo en la tarjeta.
		if (raw.body === null) {
			throw new MalformedLiteraryWorkError(slug);
		}
		return createLiteraryWorkExcerpt({
			title: raw.title ? createSectionTitle(raw.title) : undefined,
			bodyHtml: markdownToSanitizedHtml(createMarkdown(raw.body)),
		});
	}

	private mapLiteraryWork(raw: SanityLiteraryWork): LiteraryWork {
		const literaryWork = createLiteraryWork({
			...this.mapMetadata(raw),
			content: raw.content.map((section, index) => this.mapSection(section, index)),
		});
		return raw.totalReadingTime !== null
			? Object.freeze({ ...literaryWork, totalReadingTime: createReadingTime(raw.totalReadingTime) })
			: literaryWork;
	}

	private mapMetadata(raw: SanityLiteraryWorkMetadata) {
		return {
			_id: raw._id,
			slug: createSlug(raw.slug),
			title: raw.title,
			authors: raw.authors.map(mapAuthor),
			coverImage: raw.coverImage ? urlFor(raw.coverImage) : '',
			mediaSources: mapMediaSources(raw.mediaSources),
			resources: mapResources(raw.resources),
			badLanguage: raw.badLanguage,
			tags: mapTags(raw.tags),
			originalPublication: raw.originalPublication,
			publishedAt: createIsoDateTime(raw.publishedAt),
			editorialNote: raw.editorialNote ? markdownToSanitizedHtml(createMarkdown(raw.editorialNote)) : undefined,
		};
	}

	private mapSection(raw: SanityLiteraryWorkSection, index: number): LiteraryWorkSection {
		const body = createMarkdown(raw.body);
		return createLiteraryWorkSection({
			position: index,
			title: raw.title ? createSectionTitle(raw.title) : undefined,
			epigraphs: raw.epigraphs.map((epigraph) => this.mapEpigraph(epigraph)),
			bodyHtml: markdownToSanitizedHtml(body),
			readingTime: raw.readingTime !== null ? createReadingTime(raw.readingTime) : deriveSectionReadingTime(body),
		});
	}

	private mapEpigraph(raw: SanityEpigraph): AttributedText {
		// `raw.text ?? ''` deja que createMarkdown lance ante un epígrafe sin texto, en vez de silenciarlo.
		return createAttributedText({
			text: markdownToSanitizedHtml(createMarkdown(raw.text ?? '')),
			reference: raw.reference ? markdownToSanitizedHtml(createMarkdown(raw.reference)) : undefined,
		});
	}
}
