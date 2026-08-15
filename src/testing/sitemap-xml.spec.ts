import { childElementSequences, locations } from './sitemap-xml';

const entry = (children: string) => `<url>\n${children}\n</url>`;

describe('childElementSequences', () => {
	it('reads the children of each entry in order', () => {
		const xml = [
			entry('<loc>https://example.com/a</loc>\n<lastmod>2025-01-01</lastmod>'),
			entry('<loc>https://example.com/b</loc>'),
		].join('\n');

		expect(childElementSequences(xml)).toEqual([['loc', 'lastmod'], ['loc']]);
	});

	// Las extensiones habituales de un sitemap llevan prefijo de namespace y atributos. Un lector que
	// las ignore da verde ante un documento que las emite en cualquier posición.
	it('sees namespaced elements and elements carrying attributes', () => {
		const xml = entry('<loc>https://example.com</loc>\n<xhtml:link rel="alternate" href="https://example.com/en"/>');

		expect(childElementSequences(xml)).toEqual([['loc', 'xhtml:link']]);
	});

	it('yields no entry for a document without url blocks', () => {
		expect(childElementSequences('<urlset></urlset>')).toEqual([]);
	});

	// Un bloque sin cerrar no produce una secuencia parcial: no produce ninguna, y quien afirme sobre
	// la cantidad de entradas lo detecta.
	it('ignores an unclosed entry', () => {
		expect(childElementSequences('<url><loc>https://example.com</loc>')).toEqual([]);
	});
});

describe('locations', () => {
	it('reads every location in document order', () => {
		const xml = [entry('<loc>https://example.com/a</loc>'), entry('<loc>https://example.com/b</loc>')].join('\n');

		expect(locations(xml)).toEqual(['https://example.com/a', 'https://example.com/b']);
	});

	it('keeps the escaped form, which is what the document carries', () => {
		expect(locations(entry('<loc>https://example.com/?a=1&amp;b=2</loc>'))).toEqual([
			'https://example.com/?a=1&amp;b=2',
		]);
	});
});
