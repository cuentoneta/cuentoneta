import { createLiteraryWorkEpigraph, createLiteraryWorkSection } from './literary-work-section.model';
import { createChapterTitle } from './chapter-title.model';
import { createReadingTime } from './reading-time.model';
import { createSanitizedHtml } from './sanitized-html.model';

describe('createLiteraryWorkEpigraph', () => {
	it('builds a frozen epigraph from sanitized text and reference', () => {
		const epigraph = createLiteraryWorkEpigraph({
			text: createSanitizedHtml('<p>Y si el alma te pesa…</p>'),
			reference: createSanitizedHtml('<p>Rafael Obligado</p>'),
		});

		expect(epigraph.text).toBe('<p>Y si el alma te pesa…</p>');
		expect(epigraph.reference).toBe('<p>Rafael Obligado</p>');
		expect(Object.isFrozen(epigraph)).toBe(true);
	});

	it('builds an epigraph without reference', () => {
		const epigraph = createLiteraryWorkEpigraph({ text: createSanitizedHtml('<p>Texto</p>') });

		expect(epigraph.reference).toBeUndefined();
	});
});

describe('createLiteraryWorkSection', () => {
	const bodyHtml = createSanitizedHtml('<p>Cuerpo de la sección.</p>');
	const readingTime = createReadingTime(3);

	it('builds a minimal section without chapter title nor epigraphs', () => {
		const section = createLiteraryWorkSection({ bodyHtml, readingTime });

		expect(section.bodyHtml).toBe(bodyHtml);
		expect(section.readingTime).toBe(3);
		expect(section.chapterTitle).toBeUndefined();
		expect(section.epigraphs).toBeUndefined();
	});

	it('builds a full section with chapter title and epigraphs', () => {
		const section = createLiteraryWorkSection({
			chapterTitle: createChapterTitle('Capítulo Uno'),
			epigraphs: [
				createLiteraryWorkEpigraph({
					text: createSanitizedHtml('<p>Epígrafe</p>'),
					reference: createSanitizedHtml('<p>Anónimo</p>'),
				}),
			],
			bodyHtml,
			readingTime,
		});

		expect(section.chapterTitle?.value).toBe('Capítulo Uno');
		expect(section.epigraphs).toHaveLength(1);
	});

	it('returns a frozen object', () => {
		expect(Object.isFrozen(createLiteraryWorkSection({ bodyHtml, readingTime }))).toBe(true);
	});
});
