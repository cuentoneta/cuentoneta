import type { ChapterTitle } from './chapter-title.model';
import type { ReadingTime } from './reading-time.model';
import type { SanitizedHtml } from './sanitized-html.model';

export interface LiteraryWorkEpigraph {
	readonly text: SanitizedHtml;
	readonly reference: string;
}

interface CreateLiteraryWorkEpigraphOptions {
	text: SanitizedHtml;
	reference: string;
}

export function createLiteraryWorkEpigraph(options: CreateLiteraryWorkEpigraphOptions): LiteraryWorkEpigraph {
	if (options.reference.trim() === '') {
		throw new Error('LiteraryWorkEpigraph inválido: referencia vacía');
	}
	return Object.freeze({ ...options });
}

export interface LiteraryWorkSection {
	readonly chapterTitle?: ChapterTitle;
	readonly epigraphs?: readonly LiteraryWorkEpigraph[];
	readonly bodyHtml: SanitizedHtml;
	readonly readingTime: ReadingTime;
}

interface CreateLiteraryWorkSectionOptions {
	chapterTitle?: ChapterTitle;
	epigraphs?: readonly LiteraryWorkEpigraph[];
	bodyHtml: SanitizedHtml;
	readingTime: ReadingTime;
}

// Composición pura: bodyHtml y readingTime ya vienen validados por sus value objects.
export function createLiteraryWorkSection(options: CreateLiteraryWorkSectionOptions): LiteraryWorkSection {
	return Object.freeze({ ...options });
}
