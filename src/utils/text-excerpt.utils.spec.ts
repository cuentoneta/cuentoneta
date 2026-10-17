import { excerptAtWordBoundary } from './text-excerpt.utils';

describe('excerptAtWordBoundary', () => {
	it('should return the text untouched when it fits', () => {
		expect(excerptAtWordBoundary('Un texto corto.', 15)).toBe('Un texto corto.');
	});

	it('should cut at the last space before the limit and append an ellipsis', () => {
		expect(excerptAtWordBoundary('Un texto bastante largo', 14)).toBe('Un texto…');
	});

	it('should cut at the limit when there is no space before it', () => {
		expect(excerptAtWordBoundary('Supercalifragilístico', 5)).toBe('Super…');
	});

	it('should not leave trailing spaces before the ellipsis', () => {
		expect(excerptAtWordBoundary('Un texto   con espacios', 11)).toBe('Un texto…');
	});
});
