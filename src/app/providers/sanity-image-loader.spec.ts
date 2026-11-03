import { sanityImageLoader } from './sanity-image-loader';

const CDN = 'https://cdn.sanity.io/images/s4dbqkc5/production/abc-1024x1536.png';

describe('sanityImageLoader', () => {
	it('pide el ancho, el formato negociado y la calidad de la aplicación', () => {
		expect(sanityImageLoader({ src: CDN, width: 400 })).toBe(`${CDN}?w=400&auto=format&q=75`);
	});

	it('respeta el recorte que el Studio dejó en la query string', () => {
		const cropped = `${CDN}?rect=0,0,660,660`;

		expect(sanityImageLoader({ src: cropped, width: 400 })).toBe(`${cropped}&w=400&auto=format&q=75`);
	});

	it('pide el alto en lugar del ancho cuando el consumidor declara la proporción', () => {
		const loaderParams = { heightRatio: 164 / 118 };

		expect(sanityImageLoader({ src: CDN, width: 118, loaderParams })).toBe(`${CDN}?h=164&auto=format&q=75`);
		expect(sanityImageLoader({ src: CDN, width: 236, loaderParams })).toBe(`${CDN}?h=328&auto=format&q=75`);
	});

	it('respeta el recorte del Studio al pedir por alto', () => {
		const cropped = `${CDN}?rect=0,0,660,660`;

		expect(sanityImageLoader({ src: cropped, width: 118, loaderParams: { heightRatio: 164 / 118 } })).toBe(
			`${cropped}&h=164&auto=format&q=75`,
		);
	});

	it('toma el ancho del consumidor, y no el del <img>, para calcular el alto', () => {
		const loaderParams = { width: 118, heightRatio: 164 / 118 };

		expect(sanityImageLoader({ src: CDN, loaderParams })).toBe(`${CDN}?h=164&auto=format&q=75`);
	});

	it('sirve el original cuando se declara la proporción pero no hay ancho', () => {
		expect(sanityImageLoader({ src: CDN, loaderParams: { heightRatio: 1.5 } })).toBe(`${CDN}?auto=format&q=75`);
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
