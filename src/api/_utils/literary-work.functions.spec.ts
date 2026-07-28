import { isAnonymous } from '@models/literary-work.model';
import {
	multiSectionRawLiteraryWork,
	onoffRawLiteraryWorksMock,
	unmaterializedRawLiteraryWork,
} from '@mocks/onoff-raw-literary-works.mock';
import { mapLiteraryWork, type SanityLiteraryWork } from './literary-work.functions';

describe('mapLiteraryWork', () => {
	it('maps the raw query result into a frozen LiteraryWork aggregate', () => {
		const work = mapLiteraryWork(onoffRawLiteraryWorksMock[0]);

		expect(work.slug).toBe('el-palacio-de-las-nueve-fronteras');
		expect(work.title).toBe('El palacio de las nueve fronteras');
		expect(work.authors).toHaveLength(1);
		expect(work.authors[0].name).toBe('François Onoff');
		expect(Object.isFrozen(work)).toBe(true);
	});

	it('derives position from the array index and sectionCount from the content length', () => {
		const work = mapLiteraryWork(multiSectionRawLiteraryWork);

		expect(work.content.map((section) => section.position)).toEqual([0, 1]);
		expect(work.sectionCount).toBe(2);
	});

	it('converts the body through the sanitization pipeline', () => {
		const work = mapLiteraryWork(onoffRawLiteraryWorksMock[0]);
		const [first] = work.content;

		expect(first.bodyHtml).toContain('<strong>');
		expect(first.bodyHtml).not.toContain('**');
	});

	it('converts both epigraph fields through the sanitization pipeline', () => {
		const raw: SanityLiteraryWork = {
			...onoffRawLiteraryWorksMock[0],
			content: [
				{
					...onoffRawLiteraryWorksMock[0].content[0],
					epigraphs: [{ text: '_El insomnio es una lucidez que nadie pidió._', reference: '**Anónimo**' }],
				},
			],
		};

		const work = mapLiteraryWork(raw);

		expect(work.content[0].epigraphs?.[0].text).toContain('<em>El insomnio es una lucidez que nadie pidió.</em>');
		expect(work.content[0].epigraphs?.[0].reference).toContain('<strong>Anónimo</strong>');
	});

	it('reads the persisted per-section and total reading time (no recompute)', () => {
		const work = mapLiteraryWork(multiSectionRawLiteraryWork);

		expect(work.content.map((section) => section.readingTime)).toEqual([11, 1]);
		expect(work.totalReadingTime).toBe(12);
	});

	it('reads the persisted total for recited works and keeps the anonymous author untouched', () => {
		const raw: SanityLiteraryWork = {
			...onoffRawLiteraryWorksMock[0],
			authors: [{ ...onoffRawLiteraryWorksMock[0].authors[0], slug: 'anonimo' }],
			totalReadingTime: 40,
		};

		const work = mapLiteraryWork(raw);

		expect(work.totalReadingTime).toBe(40);
		expect(work.authors[0].slug).toBe('anonimo');
		expect(isAnonymous(work.authors)).toBe(true);
	});

	it('derives reading time as a pure fallback when the work is not materialized', () => {
		const work = mapLiteraryWork(unmaterializedRawLiteraryWork);

		expect(work.content.every((section) => section.readingTime >= 1)).toBe(true);
		expect(work.totalReadingTime).toBe(work.content.reduce((sum: number, section) => sum + section.readingTime, 0));
	});

	it('maps a missing coverImage to an empty string', () => {
		const raw: SanityLiteraryWork = { ...onoffRawLiteraryWorksMock[0], coverImage: null };

		expect(mapLiteraryWork(raw).coverImage).toBe('');
	});

	it('throws on an epigraph without text (defensive mapping at the boundary)', () => {
		const raw: SanityLiteraryWork = {
			...onoffRawLiteraryWorksMock[0],
			content: [{ ...onoffRawLiteraryWorksMock[0].content[0], epigraphs: [{ text: null, reference: null }] }],
		};

		expect(() => mapLiteraryWork(raw)).toThrow('Markdown inválido: contenido vacío');
	});
});
