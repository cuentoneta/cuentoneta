import type { LiteraryWorkBySlugQueryResult, LiteraryWorkSectionBySlugQueryResult } from '../sanity/types';
import { createLiteraryWork, type LiteraryWork } from '@models/literary-work.model';
import {
	createLiteraryWorkEpigraph,
	createLiteraryWorkSection,
	type LiteraryWorkEpigraph,
	type LiteraryWorkSection,
} from '@models/literary-work-section.model';
import { createChapterTitle } from '@models/chapter-title.model';
import { createMarkdown } from '@models/markdown.model';
import {
	createReadingTime,
	deriveSectionReadingTime,
	deriveTotalReadingTime,
	type ReadingTime,
} from '@models/reading-time.model';
import { createSlug } from '@models/slug.model';
import { createIsoDateTime } from '@utils/date.utils';
import { mapAuthor, mapResources, mapTags, urlFor } from './functions';
import { mapMediaSources } from './media-sources.functions';
import { markdownToSanitizedHtml } from './markdown-pipeline.functions';

export type SanityLiteraryWork = NonNullable<LiteraryWorkBySlugQueryResult>;
export type SanityLiteraryWorkSectionProjection = NonNullable<LiteraryWorkSectionBySlugQueryResult>;
type SanityLiteraryWorkSection = SanityLiteraryWork['content'][number];
type SanityLiteraryWorkEpigraph = NonNullable<SanityLiteraryWorkSection['epigraphs']>[number];

export function mapLiteraryWork(raw: SanityLiteraryWork): LiteraryWork {
	return createLiteraryWork({
		_id: raw._id,
		slug: raw.slug,
		title: raw.title,
		authors: raw.authors.map(mapAuthor),
		coverImage: raw.coverImage ? urlFor(raw.coverImage) : '',
		content: raw.content.map(mapLiteraryWorkSection),
		mediaSources: mapMediaSources(raw.mediaSources),
		resources: mapResources(raw.resources),
		badLanguage: raw.badLanguage,
		tags: mapTags(raw.tags),
		originalPublication: raw.originalPublication,
		publishedAt: createIsoDateTime(raw.publishedAt),
		totalReadingTime: resolveTotalReadingTime(
			raw.totalReadingTime,
			raw.content.map((section) => section.body),
		),
	});
}

// Proyección parcial (?section=N): construye el agregado con una única sección en `position === section`,
// SIN re-correr la invariante de posiciones contiguas de createLiteraryWork (el recorte lo hizo GROQ —
// ver LITERARY_WORK_DESIGN.md §2/§7). El `totalReadingTime` ya resuelto lo pasa el repository (persistido
// o materializado por full-fetch): la respuesta parcial no transporta todos los bodies para derivarlo.
export function mapLiteraryWorkSectionProjection(
	raw: SanityLiteraryWorkSectionProjection,
	section: number,
	totalReadingTime: ReadingTime,
): LiteraryWork | null {
	if (!raw.section) {
		return null;
	}
	return Object.freeze({
		_id: raw._id,
		slug: createSlug(raw.slug),
		title: raw.title,
		authors: raw.authors.map(mapAuthor),
		coverImage: raw.coverImage ? urlFor(raw.coverImage) : '',
		content: [mapLiteraryWorkSection(raw.section, section)],
		mediaSources: mapMediaSources(raw.mediaSources),
		resources: mapResources(raw.resources),
		badLanguage: raw.badLanguage,
		tags: mapTags(raw.tags),
		originalPublication: raw.originalPublication,
		publishedAt: createIsoDateTime(raw.publishedAt),
		totalReadingTime,
		sectionCount: raw.sectionCount,
	});
}

// Prefiere el total persistido; deriva de los bodies solo como fallback puro (obra sin materializar).
// La persistencia (write-on-read) la hace el repository por separado.
function resolveTotalReadingTime(persisted: number | null, bodies: readonly string[]): ReadingTime {
	return persisted !== null ? createReadingTime(persisted) : deriveTotalReadingTime(bodies.map(createMarkdown));
}

function mapLiteraryWorkSection(raw: SanityLiteraryWorkSection, index: number): LiteraryWorkSection {
	const body = createMarkdown(raw.body);
	return createLiteraryWorkSection({
		position: index,
		chapterTitle: raw.chapterTitle ? createChapterTitle(raw.chapterTitle) : undefined,
		epigraphs: raw.epigraphs.map(mapLiteraryWorkEpigraph),
		bodyHtml: markdownToSanitizedHtml(body),
		// Prefiere el readingTime persistido; deriva solo como fallback puro (sección sin materializar).
		readingTime: raw.readingTime !== null ? createReadingTime(raw.readingTime) : deriveSectionReadingTime(body),
	});
}

// `raw.text ?? ''` deja que createMarkdown lance ante un epígrafe sin texto: dato editorial
// inválido que debe fallar en la frontera, no propagarse silenciado.
function mapLiteraryWorkEpigraph(raw: SanityLiteraryWorkEpigraph): LiteraryWorkEpigraph {
	return createLiteraryWorkEpigraph({
		text: markdownToSanitizedHtml(createMarkdown(raw.text ?? '')),
		reference: raw.reference ? markdownToSanitizedHtml(createMarkdown(raw.reference)) : undefined,
	});
}
