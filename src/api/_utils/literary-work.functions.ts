import type { LiteraryWorkBySlugQueryResult, LiteraryWorkSectionBySlugQueryResult } from '../sanity/types';
import { createLiteraryWork, type LiteraryWork } from '@models/literary-work.model';
import {
	createLiteraryWorkEpigraph,
	createLiteraryWorkSection,
	type LiteraryWorkEpigraph,
	type LiteraryWorkSection,
} from '@models/literary-work-section.model';
import { createSectionTitle } from '@models/section-title.model';
import { createMarkdown } from '@models/markdown.model';
import { createReadingTime, deriveSectionReadingTime, type ReadingTime } from '@models/reading-time.model';
import { createSlug } from '@models/slug.model';
import { createIsoDateTime } from '@utils/date.utils';
import { mapAuthor, mapResources, mapTags, urlFor } from './functions';
import { mapMediaSources } from './media-sources.functions';
import { markdownToSanitizedHtml } from './markdown-pipeline.functions';

export type SanityLiteraryWork = NonNullable<LiteraryWorkBySlugQueryResult>;
export type SanityLiteraryWorkSectionProjection = NonNullable<LiteraryWorkSectionBySlugQueryResult>;
type SanityLiteraryWorkSection = SanityLiteraryWork['content'][number];
type SanityLiteraryWorkEpigraph = NonNullable<SanityLiteraryWorkSection['epigraphs']>[number];

// Shape de metadata común a la query full y a la de sección (difieren solo en `content`/`section`).
type SanityLiteraryWorkMetadata = Pick<
	SanityLiteraryWork,
	| '_id'
	| 'slug'
	| 'title'
	| 'authors'
	| 'coverImage'
	| 'mediaSources'
	| 'resources'
	| 'badLanguage'
	| 'tags'
	| 'originalPublication'
	| 'publishedAt'
>;

export function mapLiteraryWork(raw: SanityLiteraryWork): LiteraryWork {
	const work = createLiteraryWork({
		...mapLiteraryWorkMetadata(raw),
		content: raw.content.map(mapLiteraryWorkSection),
	});
	// El total persistido es autoritativo (obras recitadas: la duración del medio ≠ la suma del texto).
	// La factory deriva un default de las secciones (barato: los readingTime por sección ya vienen
	// persistidos) y el ACL lo sobrescribe con el valor materializado cuando está presente — igual que
	// la vía parcial (?section=N), que recibe el total ya resuelto del repository.
	return raw.totalReadingTime !== null
		? Object.freeze({ ...work, totalReadingTime: createReadingTime(raw.totalReadingTime) })
		: work;
}

// Mapeo de la metadata compartida por ambos caminos de construcción (full y proyección parcial), para no
// duplicar la superficie. El slug se brandea acá: el path de la factory lo re-valida (idempotente).
function mapLiteraryWorkMetadata(raw: SanityLiteraryWorkMetadata) {
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
	};
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
	// `section` es un slice GROQ (`content[$section...$sectionEnd]`): array de 0 o 1 elementos —
	// vacío cuando el índice está fuera de rango.
	const [rawSection] = raw.section;
	if (!rawSection) {
		return null;
	}
	return Object.freeze({
		...mapLiteraryWorkMetadata(raw),
		content: [mapLiteraryWorkSection(rawSection, section)],
		totalReadingTime,
		sectionCount: raw.sectionCount,
	});
}

function mapLiteraryWorkSection(raw: SanityLiteraryWorkSection, index: number): LiteraryWorkSection {
	const body = createMarkdown(raw.body);
	return createLiteraryWorkSection({
		position: index,
		title: raw.title ? createSectionTitle(raw.title) : undefined,
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
