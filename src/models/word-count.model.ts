export type WordCount = number & { readonly __brand: 'WordCount' };

export function createWordCount(value: number): WordCount {
	if (!Number.isInteger(value) || value < 0) {
		throw new Error(`WordCount inválido: ${value}`);
	}
	return value as WordCount;
}
