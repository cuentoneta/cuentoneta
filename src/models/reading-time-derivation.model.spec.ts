import {
	collectReadableText,
	countWords,
	deriveSectionReadingTime,
	deriveTotalReadingTime,
} from './reading-time-derivation.model';
import { deriveReadingTime } from './reading-time.model';
import { createMarkdown } from './markdown.model';

type MarkdownNode = Parameters<typeof collectReadableText>[0];

describe('collectReadableText', () => {
	it('traverses a tree deeper than the call stack without exhausting it', () => {
		// Supera la pila del worker con un colector recursivo: una regresión tira RangeError.
		const depth = 200_000;
		let node: MarkdownNode = { type: 'text', value: 'palabra' };
		for (let level = 0; level < depth; level++) {
			node = { type: 'blockquote', children: [node] };
		}
		const fragments: string[] = [];

		collectReadableText(node, fragments);

		expect(fragments).toEqual(['palabra']);
	});

	it('collects the readable literals in document order', () => {
		const root: MarkdownNode = {
			type: 'root',
			children: [
				{
					type: 'paragraph',
					children: [
						{ type: 'text', value: 'uno' },
						{ type: 'inlineCode', value: 'dos' },
					],
				},
				{ type: 'code', value: 'tres' },
				{ type: 'html', value: '<b>' },
				{ type: 'paragraph', children: [{ type: 'text', value: 'cuatro' }] },
			],
		};
		const fragments: string[] = [];

		collectReadableText(root, fragments);

		expect(fragments).toEqual(['uno', 'dos', 'tres', 'cuatro']);
	});
});

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

	it('counts words inside nested blockquotes', () => {
		expect(countWords(createMarkdown('> '.repeat(1_000) + 'palabra'))).toBe(1);
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
