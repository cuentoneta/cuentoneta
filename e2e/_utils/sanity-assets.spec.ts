import { placeholderFor } from './sanity-assets';

const CDN = 'https://cdn.sanity.io/images/s4dbqkc5/production';

describe('placeholderFor', () => {
	it('conserva las dimensiones que el nombre del asset declara', () => {
		expect(placeholderFor(`${CDN}/abc-1024x1536.png`)).toContain('width="1024" height="1536"');
	});

	it.each([
		['una query string de recorte', `${CDN}/abc-660x860.png?rect=0,0,660,660`],
		['los parámetros de transformación', `${CDN}/abc-660x860.jpg?w=400&auto=format&q=75`],
	])('ignora %s al leer las dimensiones', (_, url) => {
		expect(placeholderFor(url)).toContain('width="660" height="860"');
	});

	it.each([
		['un asset sin dimensiones en el nombre', 'https://cdn.sanity.io/files/s4dbqkc5/production/abc.m4a'],
		['una URL mal formada', 'no-es-una-url'],
	])('cae a 1×1 ante %s', (_, url) => {
		expect(placeholderFor(url)).toContain('width="1" height="1"');
	});

	it('devuelve un SVG transparente, sin contenido que pintar', () => {
		expect(placeholderFor(`${CDN}/abc-10x10.png`)).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>',
		);
	});
});
