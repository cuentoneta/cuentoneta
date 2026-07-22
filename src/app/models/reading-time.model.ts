import { unified } from 'unified';
import remarkParse from 'remark-parse';
import type { Markdown } from './markdown.model';
import { createWordCount, type WordCount } from './word-count.model';

export type ReadingTime = number & { readonly __brand: 'ReadingTime' };

export function createReadingTime(minutes: number): ReadingTime {
	if (!Number.isInteger(minutes) || minutes < 1) {
		throw new Error(`ReadingTime inválido: ${minutes}`);
	}
	return minutes as ReadingTime;
}

export function deriveReadingTime(wordCount: WordCount, wordsPerMinute?: number): ReadingTime {
	// Tasa de lectura (palabras por minuto), no un intervalo de tiempo: no aplica la
	// convención de duration strings.
	const defaultWordsPerMinute = 200;
	return createReadingTime(Math.max(1, Math.ceil(wordCount / (wordsPerMinute ?? defaultWordsPerMinute))));
}

export function sumReadingTimes(times: readonly ReadingTime[]): ReadingTime {
	return createReadingTime(
		Math.max(
			1,
			times.reduce((sum: number, time) => sum + time, 0),
		),
	);
}

// Tipado estructural mínimo del mdast: alcanza para el walker sin acoplar @types/mdast.
interface MarkdownNode {
	readonly type: string;
	readonly value?: string;
	readonly children?: readonly MarkdownNode[];
}

// Solo texto que el lector efectivamente lee: excluye nodos `html` crudos (tags no son palabras)
// y el `alt` de las imágenes (metadata) — semántica que mdast-util-to-string incluía por defecto.
const readableLiteralTypes = new Set(['text', 'inlineCode', 'code']);

function collectReadableText(node: MarkdownNode, fragments: string[]): void {
	if (node.value !== undefined && readableLiteralTypes.has(node.type)) {
		fragments.push(node.value);
	}
	node.children?.forEach((child) => collectReadableText(child, fragments));
}

// Singleton de módulo: construir el parser unified es costoso y es inmutable.
const markdownParser = unified().use(remarkParse);

export function countWords(markdown: Markdown): WordCount {
	const fragments: string[] = [];
	collectReadableText(markdownParser.parse(markdown), fragments);
	// Una palabra contiene al menos una letra o número: la puntuación que queda suelta al
	// separar nodos inline ("negrita" + ",") no cuenta.
	const words = fragments
		.join(' ')
		.split(/\s+/)
		.filter((word) => /[\p{L}\p{N}]/u.test(word));
	return createWordCount(words.length);
}
