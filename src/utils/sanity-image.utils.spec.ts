import { isSanityImageUrl, resolveSearchImage, withSanityImageParams } from './sanity-image.utils';

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

describe('resolveSearchImage', () => {
	const asset = 'https://cdn.sanity.io/images/s4dbqkc5/production/abc';

	it.each([
		{ url: `${asset}-1200x800.jpg`, expected: { url: `${asset}-1200x800.jpg?fm=jpg`, pixelArea: 960_000 } },
		{ url: `${asset}-400x600.webp`, expected: { url: `${asset}-400x600.webp?fm=jpg`, pixelArea: 240_000 } },
		{ url: `${asset}-150x200.png`, expected: { url: `${asset}-150x200.png?fm=jpg`, pixelArea: 30_000 } },
		// Con recorte del Studio, el CDN sirve el `rect` y no el original.
		{
			url: `${asset}-3000x2000.jpg?rect=0,0,200,200`,
			expected: { url: `${asset}-3000x2000.jpg?rect=0,0,200,200&fm=jpg`, pixelArea: 40_000 },
		},
		// Un recorte ilegible no permite saber qué se sirve: el área del original no lo describe.
		{ url: `${asset}-3000x2000.jpg?rect=0,0,abc`, expected: { url: `${asset}-3000x2000.jpg?rect=0,0,abc&fm=jpg` } },
		{ url: `${asset}.png`, expected: { url: `${asset}.png?fm=jpg` } },
	])('should resolve "$url" to its JPG and its served area', ({ url, expected }) => {
		expect(resolveSearchImage(url)).toEqual(expected);
	});

	it.each([
		`${asset}-600x800.svg`,
		`${asset}-600x800.SVG?rect=0,0,300,300`,
		'',
		'/assets/svg/cover-placeholder.svg',
		'https://user-images.githubusercontent.com/1/2.png',
		'http://cdn.sanity.io/images/s4dbqkc5/production/abc-1200x800.jpg',
		'no es una url',
	])('should not resolve "%s"', (url) => {
		expect(resolveSearchImage(url)).toBeUndefined();
	});
});
