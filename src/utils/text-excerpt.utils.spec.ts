import { excerptAtWordBoundary, wordBoundaryEnd } from './text-excerpt.utils';

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

	it('should cut at a line break as a word boundary', () => {
		expect(excerptAtWordBoundary('primera línea\nsegunda línea', 20)).toBe('primera línea…');
	});
});

describe('wordBoundaryEnd', () => {
	it('should return the text length when the text fits', () => {
		expect(wordBoundaryEnd('Un texto corto.', 20)).toBe(15);
	});

	it('should not cut a text whose length equals the limit', () => {
		expect(wordBoundaryEnd('Un texto corto.', 15)).toBe(15);
	});

	it('should end at the last line break before the limit', () => {
		expect(wordBoundaryEnd('primera línea\nsegunda', 16)).toBe(13);
	});

	it('should exclude the run of whitespace that precedes the cut', () => {
		expect(wordBoundaryEnd('Un texto \n\t con espacios', 13)).toBe(8);
	});

	it('should end at the limit when a single word is longer than it', () => {
		expect(wordBoundaryEnd('Supercalifragilístico', 5)).toBe(5);
	});
});
