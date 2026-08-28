import { isSanityImageUrl, sanityImageLoader } from './sanity-image-loader';

const CDN = 'https://cdn.sanity.io/images/s4dbqkc5/production/abc-1024x1536.png';

describe('isSanityImageUrl', () => {
	it.each([CDN, `${CDN}?rect=0,0,660,660`, 'https://cdn.sanity.io/files/s4dbqkc5/production/abc.m4a'])(
		'reconoce "%s" como asset del CDN',
		(src) => {
			expect(isSanityImageUrl(src)).toBe(true);
		},
	);

	it.each([
		// Un host que contiene el del CDN como sufijo o como segmento de ruta no es el CDN.
		'https://cdn.sanity.io.evil.com/images/abc.png',
		'https://evil.com/cdn.sanity.io/images/abc.png',
		// Lo que la aplicación pinta con `ngSrc` sin ser de Sanity: assets propios y un host externo.
		'./assets/svg/logo.svg',
		'/assets/svg/cover-placeholder.svg',
		'https://user-images.githubusercontent.com/1/2.png',
		'',
	])('no reconoce "%s"', (src) => {
		expect(isSanityImageUrl(src)).toBe(false);
	});
});

describe('sanityImageLoader', () => {
	it('pide el ancho, el formato negociado y la calidad de la aplicación', () => {
		expect(sanityImageLoader({ src: CDN, width: 400 })).toBe(`${CDN}?w=400&auto=format&q=75`);
	});

	it('respeta el recorte que el Studio dejó en la query string', () => {
		const cropped = `${CDN}?rect=0,0,660,660`;

		expect(sanityImageLoader({ src: cropped, width: 400 })).toBe(`${cropped}&w=400&auto=format&q=75`);
	});

	it('omite el ancho cuando el consumidor no lo declara', () => {
		expect(sanityImageLoader({ src: CDN })).toBe(`${CDN}?auto=format&q=75`);
	});

	it.each([
		'./assets/svg/logo.svg',
		'/assets/svg/cover-placeholder.svg',
		'https://user-images.githubusercontent.com/1/2.png',
		'https://cdn.sanity.io.evil.com/images/abc.png',
	])('deja intacto "%s", que no es del CDN', (src) => {
		expect(sanityImageLoader({ src, width: 400 })).toBe(src);
	});
});
