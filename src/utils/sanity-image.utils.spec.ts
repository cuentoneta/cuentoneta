import { isSanityImageUrl, withSanityImageParams } from './sanity-image.utils';

describe('isSanityImageUrl', () => {
	it.each([
		'https://cdn.sanity.io/images/s4dbqkc5/production/abc-1024x1536.png',
		'https://cdn.sanity.io/images/s4dbqkc5/production/abc-660x860.png?rect=0,0,660,660',
		'https://cdn.sanity.io/files/s4dbqkc5/production/abc.m4a',
	])('should recognize "%s" as a CDN asset', (url) => {
		expect(isSanityImageUrl(url)).toBe(true);
	});

	it.each([
		// Un host que contiene el del CDN como sufijo o como segmento de ruta no es el CDN: se compara
		// el hostname parseado, no el texto.
		'https://cdn.sanity.io.evil.com/images/abc.png',
		'https://evil.com/cdn.sanity.io/images/abc.png',
		'https://www.sanity.io/images/abc.png',
		// El CDN solo sirve por HTTPS.
		'http://cdn.sanity.io/images/abc.png',
		// Lo que la aplicación pinta con `ngSrc` sin ser de Sanity: assets propios y un host externo.
		'./assets/svg/logo.svg',
		'/assets/svg/cover-placeholder.svg',
		'https://user-images.githubusercontent.com/1/2.png',
		'',
	])('should not recognize "%s"', (url) => {
		expect(isSanityImageUrl(url)).toBe(false);
	});
});

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

	it('should include the recompression quality when requested', () => {
		expect(withSanityImageParams(base, { w: 400, auto: 'format', q: 75 })).toBe(`${base}?w=400&auto=format&q=75`);
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
