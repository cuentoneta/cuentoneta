import type { SanityClient } from '@sanity/client';
import type { LiteraryWorkBySlugQueryResult, LiteraryWorksByAuthorSlugQueryResult } from '@sanity-types';
import { createLiteraryWork, type LiteraryWork, type LiteraryWorkTeaser } from '@models/literary-work.model';
import { createAttributedText, type AttributedText } from '@models/attributed-text.model';
import { createLiteraryWorkSection, type LiteraryWorkSection } from '@models/literary-work-section.model';
import { createLiteraryWorkExcerpt } from '@models/literary-work-excerpt.model';
import { createSectionTitle } from '@models/section-title.model';
import { createMarkdown } from '@models/markdown.model';
import { createReadingTime, deriveSectionReadingTime } from '@models/reading-time.model';
import { createSlug } from '@models/slug.model';
import { createIsoDateTime } from '@utils/date.utils';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import { mapAuthor, mapAuthorTeaser, mapResources, mapTags, urlFor } from '../../_utils/functions';
import { mapMediaSources, mapMediaTeasers } from '../../_utils/media-sources.functions';
import { client as sanityClient } from '../../_helpers/sanity-connector';
import { literaryWorkBySlugQuery, literaryWorksByAuthorSlugQuery } from '../../_queries/literary-work.query';
import { MalformedLiteraryWorkError } from './literary-work.errors';
import type { LiteraryWorkRepository } from './literary-work.repository';

type SanityLiteraryWork = NonNullable<LiteraryWorkBySlugQueryResult>;
type SanityLiteraryWorkSection = SanityLiteraryWork['content'][number];
type SanityEpigraph = NonNullable<SanityLiteraryWorkSection['epigraphs']>[number];
type SanityLiteraryWorkMetadata = Omit<SanityLiteraryWork, 'content'>;
// La proyección de teaser que comparten las queries de listado (por autor acá, por colección en su
// módulo): mismo shape, distinta query.
type SanityLiteraryWorkTeaser = LiteraryWorksByAuthorSlugQueryResult[number];

export class SanityLiteraryWorkRepository implements LiteraryWorkRepository {
	constructor(private readonly client: SanityClient = sanityClient) {}

	public async fetchBySlug(slug: string): Promise<LiteraryWork | null> {
		const raw = await this.client.fetch(literaryWorkBySlugQuery, { slug });
		if (!raw) {
			return null;
		}
		return this.mapLiteraryWork(raw);
	}

	public async fetchByAuthorSlug(slug: string): Promise<LiteraryWorkTeaser[]> {
		const raw = await this.client.fetch(literaryWorksByAuthorSlugQuery, { slug });

		// Un listado que esconde elementos es un bug de datos que nadie ve: una obra inconstruible tumba
		// la llamada entera, y el error nombra la obra culpable porque sobre decenas de obras ese es el
		// dato que permite arreglarlo.
		return raw.map((work) => this.mapLiteraryWorkTeaser(work));
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

	// Toda obra que no pueda construirse como teaser —sin apertura, sin cuerpo de extracto o sin
	// tiempo de lectura total persistido— lanza acá, y el catch único convierte cualquier fallo en el
	// error tipado del módulo con la causa original preservada. Congelado como todo lo que sale de la
	// superficie de dominio: el teaser no tiene factory propia —la vista no la necesitó hasta ahora—,
	// pero eso no lo vuelve el único objeto mutable que cruza la frontera.
	private mapLiteraryWorkTeaser(raw: SanityLiteraryWorkTeaser): LiteraryWorkTeaser {
		try {
			const [rawExcerpt] = raw.excerpt;
			if (!rawExcerpt) {
				throw new Error('sin sección de apertura');
			}
			if (raw.totalReadingTime === null) {
				// Sin derivación que sirva: en una obra de texto el total es la suma de sus secciones, pero
				// en una recitada es la duración del medio. Rellenarlo acá acertaría en una y fallaría en la otra.
				throw new Error('sin tiempo de lectura total persistido');
			}
			const { body } = rawExcerpt;
			if (body === null) {
				throw new Error('extracto sin cuerpo');
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
				excerpt: createLiteraryWorkExcerpt({
					title: rawExcerpt.title ? createSectionTitle(rawExcerpt.title) : undefined,
					bodyHtml: markdownToSanitizedHtml(createMarkdown(body)),
				}),
			});
		} catch (cause) {
			throw new MalformedLiteraryWorkError(raw.slug, { cause });
		}
	}
}
