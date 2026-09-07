import type { WordCount } from './word-count.model';

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
