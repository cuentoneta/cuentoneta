import { countWords, deriveSectionReadingTime, deriveTotalReadingTime } from './reading-time-derivation.model';
import { deriveReadingTime } from './reading-time.model';
import { createMarkdown } from './markdown.model';

describe('countWords', () => {
	it('counts the words of a plain paragraph', () => {
		expect(countWords(createMarkdown('Una obra de cinco palabras.'))).toBe(5);
	});

	it('counts plain-text words without inflating the count with markdown syntax', () => {
		expect(countWords(createMarkdown('Texto con **negrita**, _cursiva_ y un [enlace](https://example.com).'))).toBe(7);
	});

	it('ignores whitespace-only segments and preserves word boundaries across blocks', () => {
		expect(countWords(createMarkdown('Una   palabra\n\n\ny   otra'))).toBe(4);
	});

	it('does not count raw HTML tags nor image alt text as words', () => {
		expect(
			countWords(
				createMarkdown(
					'Dos palabras\n\n<div class="x">tres</div>\n\n![alt largo de imagen](https://example.com/i.jpg)',
				),
			),
		).toBe(2);
	});

	it('counts accented and non-latin letters as words', () => {
		expect(countWords(createMarkdown('corazón 夜'))).toBe(2);
	});

	it('traverses deeply nested blocks without exhausting the call stack', () => {
		expect(countWords(createMarkdown('> '.repeat(20_000) + 'palabra'))).toBe(1);
	});

	it('feeds deriveReadingTime for the full markdown-to-minutes flow', () => {
		const words = countWords(createMarkdown('palabra '.repeat(401).trim()));
		expect(deriveReadingTime(words)).toBe(3);
	});
});

describe('deriveSectionReadingTime', () => {
	it('composes countWords and deriveReadingTime for a section body', () => {
		expect(deriveSectionReadingTime(createMarkdown('palabra '.repeat(401).trim()))).toBe(3);
	});

	it('returns at least 1 minute for a short section', () => {
		expect(deriveSectionReadingTime(createMarkdown('Una obra corta.'))).toBe(1);
	});
});

describe('deriveTotalReadingTime', () => {
	it('equals the single section time for a one-section work', () => {
		expect(deriveTotalReadingTime([createMarkdown('palabra '.repeat(401).trim())])).toBe(3);
	});

	it('sums the per-section reading times of a multi-section work', () => {
		const body = createMarkdown('palabra '.repeat(401).trim()); // 3 min cada una
		expect(deriveTotalReadingTime([body, body])).toBe(6);
	});

	it('returns at least 1 minute for a work whose sections are all very short', () => {
		expect(deriveTotalReadingTime([createMarkdown('Breve.')])).toBe(1);
	});

	it('returns at least 1 minute for a work without sections', () => {
		expect(deriveTotalReadingTime([])).toBe(1);
	});
});
