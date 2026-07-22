import { createChapterTitle } from './chapter-title.model';

describe('createChapterTitle', () => {
	it('exposes the original value untouched', () => {
		const title = createChapterTitle('Capítulo Uno');
		expect(title.value).toBe('Capítulo Uno');
	});

	it('throws on an empty or whitespace-only title', () => {
		expect(() => createChapterTitle('')).toThrow('ChapterTitle inválido: título vacío');
		expect(() => createChapterTitle('   ')).toThrow('ChapterTitle inválido: título vacío');
	});

	it('returns a frozen object', () => {
		expect(Object.isFrozen(createChapterTitle('Capítulo Uno'))).toBe(true);
	});

	describe('toAnchor', () => {
		it('derives a valid Slug from a plain title', () => {
			expect(createChapterTitle('Segunda parte').toAnchor()).toBe('segunda-parte');
		});

		it('normalizes accents, punctuation and casing', () => {
			expect(createChapterTitle('¡Capítulo Uno!').toAnchor()).toBe('capitulo-uno');
		});

		it('produces an anchor that satisfies the Slug invariant for symbol-heavy titles', () => {
			// createSlug lanza ante formato inválido: si esto no lanza, el anchor es un Slug válido.
			expect(() => createChapterTitle('El "fin"... ¿o no?').toAnchor()).not.toThrow();
		});
	});
});
