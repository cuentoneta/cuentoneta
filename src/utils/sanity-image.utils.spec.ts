import { withSanityImageParams } from './sanity-image.utils';

describe('withSanityImageParams', () => {
	const base = 'https://cdn.sanity.io/images/s4dbqkc5/production/abc-580x579.avif';

	it('should append params with `?` when the url has no query string', () => {
		expect(withSanityImageParams(base, { h: 64, w: 64 })).toBe(`${base}?h=64&w=64`);
	});

	it('should append params with `&` when the url already carries a crop (`?rect=...`)', () => {
		const cropped = `${base}?rect=44,0,480,480`;

		expect(withSanityImageParams(cropped, { h: 64, w: 64 })).toBe(`${cropped}&h=64&w=64`);
	});

	it('should include auto=format when requested', () => {
		expect(withSanityImageParams(base, { h: 60, w: 60, auto: 'format' })).toBe(`${base}?h=60&w=60&auto=format`);
	});

	it('should omit params whose value is undefined', () => {
		expect(withSanityImageParams(base, { w: 32 })).toBe(`${base}?w=32`);
	});

	it('should return the url untouched when there are no params', () => {
		expect(withSanityImageParams(base, {})).toBe(base);
	});

	it('should return an empty string as-is', () => {
		expect(withSanityImageParams('', { w: 64 })).toBe('');
	});
});
