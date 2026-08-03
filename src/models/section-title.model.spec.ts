import { createSectionTitle } from './section-title.model';

describe('createSectionTitle', () => {
	it('exposes the original value untouched', () => {
		const title = createSectionTitle('Capítulo Uno');
		expect(title.value).toBe('Capítulo Uno');
	});

	it('throws on an empty or whitespace-only title', () => {
		expect(() => createSectionTitle('')).toThrow('SectionTitle inválido: título vacío');
		expect(() => createSectionTitle('   ')).toThrow('SectionTitle inválido: título vacío');
	});

	it('returns a frozen object', () => {
		expect(Object.isFrozen(createSectionTitle('Capítulo Uno'))).toBe(true);
	});

	describe('toAnchor', () => {
		it('derives a valid Slug from a plain title', () => {
			expect(createSectionTitle('Segunda parte').toAnchor()).toBe('segunda-parte');
		});

		it('normalizes accents, punctuation and casing', () => {
			expect(createSectionTitle('¡Capítulo Uno!').toAnchor()).toBe('capitulo-uno');
		});

		it('produces an anchor that satisfies the Slug invariant for symbol-heavy titles', () => {
			// createSlug lanza ante formato inválido: si esto no lanza, el anchor es un Slug válido.
			expect(() => createSectionTitle('El "fin"... ¿o no?').toAnchor()).not.toThrow();
		});
	});
});
