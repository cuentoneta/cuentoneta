import { countWords, createReadingTime, deriveReadingTime, sumReadingTimes } from './reading-time.model';
import { createMarkdown } from './markdown.model';
import { createWordCount } from './word-count.model';

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

	it('feeds deriveReadingTime for the full markdown-to-minutes flow', () => {
		const words = countWords(createMarkdown('palabra '.repeat(401).trim()));
		expect(deriveReadingTime(words)).toBe(3);
	});
});

describe('createReadingTime', () => {
	it('returns the value branded as ReadingTime when it is a positive integer', () => {
		expect(createReadingTime(1)).toBe(1);
		expect(createReadingTime(12)).toBe(12);
	});

	it('throws on an integer below 1', () => {
		expect(() => createReadingTime(0)).toThrow('ReadingTime inválido: 0');
	});

	it('throws on a non-integer number', () => {
		expect(() => createReadingTime(2.5)).toThrow('ReadingTime inválido: 2.5');
	});
});

describe('deriveReadingTime', () => {
	it('divides the word count by the default rate rounding up', () => {
		expect(deriveReadingTime(createWordCount(401))).toBe(3);
		expect(deriveReadingTime(createWordCount(400))).toBe(2);
	});

	it('returns at least 1 minute for very short content', () => {
		expect(deriveReadingTime(createWordCount(0))).toBe(1);
		expect(deriveReadingTime(createWordCount(50))).toBe(1);
	});

	it('accepts a custom words-per-minute rate', () => {
		expect(deriveReadingTime(createWordCount(300), 100)).toBe(3);
	});
});

describe('sumReadingTimes', () => {
	it('sums the reading times of multiple sections', () => {
		const times = [createReadingTime(2), createReadingTime(3), createReadingTime(1)];
		expect(sumReadingTimes(times)).toBe(6);
	});

	it('returns at least 1 minute for an empty list', () => {
		expect(sumReadingTimes([])).toBe(1);
	});
});
