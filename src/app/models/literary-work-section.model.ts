import type { ChapterTitle } from './chapter-title.model';
import type { ReadingTime } from './reading-time.model';
import type { SanitizedHtml } from './sanitized-html.model';

export interface LiteraryWorkEpigraph {
	readonly text: SanitizedHtml;
	readonly reference?: SanitizedHtml;
}

interface CreateLiteraryWorkEpigraphOptions {
	text: SanitizedHtml;
	reference?: SanitizedHtml;
}

// Composición pura: text y reference ya vienen validados por SanitizedHtml.
export function createLiteraryWorkEpigraph(options: CreateLiteraryWorkEpigraphOptions): LiteraryWorkEpigraph {
	return Object.freeze({ ...options });
}

export interface LiteraryWorkSection {
	// Identidad numérica de la sección en la obra: 0-based, igual al índice del array en el CMS
	// (sin transformación 0↔1 en el flujo). Estable ante respuestas parciales del endpoint —
	// ver LITERARY_WORK_DESIGN.md §3/§7.
	readonly position: number;
	readonly chapterTitle?: ChapterTitle;
	readonly epigraphs?: readonly LiteraryWorkEpigraph[];
	readonly bodyHtml: SanitizedHtml;
	readonly readingTime: ReadingTime;
}

interface CreateLiteraryWorkSectionOptions {
	position: number;
	chapterTitle?: ChapterTitle;
	epigraphs?: readonly LiteraryWorkEpigraph[];
	bodyHtml: SanitizedHtml;
	readingTime: ReadingTime;
}

export function createLiteraryWorkSection(options: CreateLiteraryWorkSectionOptions): LiteraryWorkSection {
	if (!Number.isInteger(options.position) || options.position < 0) {
		throw new Error(`LiteraryWorkSection inválida: position ${options.position} (debe ser un entero >= 0)`);
	}
	return Object.freeze({ ...options });
}
