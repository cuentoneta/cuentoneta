import { createWordCount } from './word-count.model';

describe('createWordCount', () => {
	it('returns the value branded as WordCount when it is a non-negative integer', () => {
		expect(createWordCount(0)).toBe(0);
		expect(createWordCount(1500)).toBe(1500);
	});

	it('throws on a negative number', () => {
		expect(() => createWordCount(-1)).toThrow('WordCount inválido: -1');
	});

	it('throws on a non-integer number', () => {
		expect(() => createWordCount(3.5)).toThrow('WordCount inválido: 3.5');
	});
});
