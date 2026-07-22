import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { toString as mdastToString } from 'mdast-util-to-string';
import type { Markdown } from './markdown.model';
import { createWordCount, type WordCount } from './word-count.model';

export type ReadingTime = number & { readonly __brand: 'ReadingTime' };

const markdownParser = unified().use(remarkParse);

export function countWords(markdown: Markdown): WordCount {
	const tree = markdownParser.parse(markdown);
	// mdastToString concatena bloques hermanos sin separador ("fin.Inicio"): unir los bloques
	// de nivel superior con espacio preserva el límite de palabra entre párrafos.
	const words = tree.children
		.map((block) => mdastToString(block))
		.join(' ')
		.split(/\s+/)
		.filter((word) => word.length > 0);
	return createWordCount(words.length);
}

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
