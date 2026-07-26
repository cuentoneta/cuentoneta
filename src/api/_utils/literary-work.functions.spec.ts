import { mapLiteraryWork } from './literary-work.functions';
import {
	rawAnonymousLiteraryWork,
	rawLiteraryWork,
	rawUnmaterializedLiteraryWork,
} from '../_mocks/literary-work-raw.mock';
import { isAnonymous } from '@models/literary-work.model';

// TODO: Redirigir estos tests y para que utilicen los mocks del canon de Onoff al implementar #1653
describe('mapLiteraryWork', () => {
	it('maps the raw query result into a frozen LiteraryWork aggregate', () => {
		const work = mapLiteraryWork(rawLiteraryWork);

		expect(work.slug).toBe('la-vigilia-de-onoff');
		expect(work.title).toBe('La vigilia de Onoff');
		expect(work.authors).toHaveLength(1);
		expect(work.authors[0].name).toBe('François Onoff');
		expect(Object.isFrozen(work)).toBe(true);
	});

	it('derives position from the array index and sectionCount from the content length', () => {
		const work = mapLiteraryWork(rawLiteraryWork);

		expect(work.content.map((section) => section.position)).toEqual([0, 1]);
		expect(work.sectionCount).toBe(2);
	});

	it('converts body and both epigraph fields through the sanitization pipeline', () => {
		const work = mapLiteraryWork(rawLiteraryWork);
		const [first] = work.content;

		expect(first.bodyHtml).toContain('<strong>una taza fría</strong>');
		expect(first.bodyHtml).not.toContain('**');
		expect(first.epigraphs?.[0].text).toContain('<em>El insomnio es una lucidez que nadie pidió.</em>');
		expect(first.epigraphs?.[0].reference).toContain('<strong>Anónimo</strong>');
	});

	it('enriches Sanity CDN images inside the body with dimensions', () => {
		const work = mapLiteraryWork(rawLiteraryWork);

		expect(work.content[0].bodyHtml).toContain('width="800"');
		expect(work.content[0].bodyHtml).toContain('loading="lazy"');
	});

	it('reads the persisted per-section and total reading time (no recompute)', () => {
		const work = mapLiteraryWork(rawLiteraryWork);

		expect(work.content.map((section) => section.readingTime)).toEqual([1, 1]);
		expect(work.totalReadingTime).toBe(2);
	});

	it('reads the persisted total for recited works (editor-set, independent of the section sum)', () => {
		const work = mapLiteraryWork(rawAnonymousLiteraryWork);

		expect(work.totalReadingTime).toBe(40);
	});

	it('derives reading time as a pure fallback when the work is not materialized', () => {
		const work = mapLiteraryWork(rawUnmaterializedLiteraryWork);

		expect(work.content.every((section) => section.readingTime >= 1)).toBe(true);
		expect(work.totalReadingTime).toBe(work.content.reduce((sum: number, section) => sum + section.readingTime, 0));
	});

	it('maps a missing coverImage to an empty string', () => {
		expect(mapLiteraryWork(rawAnonymousLiteraryWork).coverImage).toBe('');
	});

	it('keeps the anonymous author untouched — no normalization in the mapper', () => {
		const work = mapLiteraryWork(rawAnonymousLiteraryWork);

		expect(work.authors).toHaveLength(1);
		expect(work.authors[0].slug).toBe('anonimo');
		expect(isAnonymous(work.authors)).toBe(true);
	});

	it('throws on an epigraph without text (defensive mapping at the boundary)', () => {
		const brokenRaw = {
			...rawLiteraryWork,
			content: [{ ...rawLiteraryWork.content[0], epigraphs: [{ text: null, reference: null }] }],
		};

		expect(() => mapLiteraryWork(brokenRaw)).toThrow('Markdown inválido: contenido vacío');
	});
});
