import {
	expectationsFor,
	parseSitemap,
	sample,
	selectByType,
	slugOf,
	slugToTitlePattern,
	toPath,
} from './seo-smoke.helpers';

describe('slugToTitlePattern', () => {
	it('matchea el título derivado del slug (sin acentos)', () => {
		expect(slugToTitlePattern('el-aleph').test('El Aleph — La Cuentoneta')).toBe(true);
	});

	it('matchea accent-insensitive (el slug aplana acentos que el título conserva)', () => {
		expect(slugToTitlePattern('ruben-dario').test('Cuentos de Rubén Darío')).toBe(true);
		expect(slugToTitlePattern('la-cancion').test('La Canción')).toBe(true);
	});

	it('usa el token más largo, robusto ante sufijos de desambiguación', () => {
		expect(slugToTitlePattern('el-aleph-2').test('El Aleph')).toBe(true);
	});

	it('cae al slug completo si ningún token tiene letras', () => {
		expect(slugToTitlePattern('2022').test('2022')).toBe(true);
	});

	it('no matchea un título ajeno', () => {
		expect(slugToTitlePattern('el-aleph').test('Otro cuento')).toBe(false);
	});
});

describe('toPath', () => {
	it('extrae el pathname de una URL absoluta', () => {
		expect(toPath('https://www.cuentoneta.ar/story/el-fin')).toBe('/story/el-fin');
	});

	it('devuelve null ante una URL inválida', () => {
		expect(toPath('no-es-una-url')).toBeNull();
	});
});

describe('parseSitemap', () => {
	it('extrae los paths de los <loc> (absolutos → pathname)', () => {
		const xml = `<?xml version="1.0"?><urlset><url><loc>https://x.ar/story/a</loc></url><url><loc>https://x.ar/author/b</loc></url></urlset>`;
		expect(parseSitemap(xml)).toEqual(['/story/a', '/author/b']);
	});

	it('devuelve [] para un sitemap sin urls', () => {
		expect(parseSitemap('<urlset></urlset>')).toEqual([]);
	});
});

describe('sample', () => {
	it('devuelve [] con tamaño 0', () => {
		expect(sample(['a', 'b', 'c'], 0)).toEqual([]);
	});

	it('no excede el pool cuando el tamaño lo supera', () => {
		expect(sample(['a', 'b'], 5).sort()).toEqual(['a', 'b']);
	});

	it('devuelve elementos distintos del pool', () => {
		const picked = sample(['a', 'b', 'c', 'd'], 2);
		expect(picked).toHaveLength(2);
		expect(new Set(picked).size).toBe(2);
		picked.forEach((path) => expect(['a', 'b', 'c', 'd']).toContain(path));
	});
});

describe('selectByType', () => {
	const paths = ['/story/a', '/story/b', '/author/c', '/storylist/d'];

	it('filtra por prefijo de tipo', () => {
		expect(selectByType(paths, '/author/', 5, true)).toEqual(['/author/c']);
	});

	it('con full=true devuelve todos los del tipo', () => {
		expect(selectByType(paths, '/story/', 1, true).sort()).toEqual(['/story/a', '/story/b']);
	});

	it('con full=false muestrea hasta size', () => {
		expect(selectByType(paths, '/story/', 1, false)).toHaveLength(1);
	});
});

describe('expectationsFor', () => {
	it('story: patrón por slug + JSON-LD Article + enlace a autor', () => {
		const expectations = expectationsFor('/story/el-aleph');
		expect(expectations?.titlePattern?.test('El Aleph')).toBe(true);
		expect(expectations?.h1Pattern?.test('El Aleph')).toBe(true);
		expect(expectations?.canonicalContains).toBe('/story/el-aleph');
		expect(expectations?.requiredInternalLinkPrefix).toBe('/author/');
		expect(expectations?.requiredJsonLdIds).toContain('article');
	});

	it('author: patrón por slug + ProfilePage + enlace a cuento', () => {
		const expectations = expectationsFor('/author/jorge-luis-borges');
		expect(expectations?.titlePattern?.test('Jorge Luis Borges')).toBe(true);
		expect(expectations?.requiredInternalLinkPrefix).toBe('/story/');
		expect(expectations?.requiredJsonLdIds).toContain('profile-page');
	});

	it('storylist: sin titlePattern (título editorial) + CollectionPage', () => {
		const expectations = expectationsFor('/storylist/verano-2022');
		expect(expectations?.titlePattern).toBeUndefined();
		expect(expectations?.requiredJsonLdIds).toContain('collection');
	});

	it('devuelve null para un path no indexable por tipo', () => {
		expect(expectationsFor('/about')).toBeNull();
	});
});

describe('slugOf', () => {
	it('toma el último segmento del path', () => {
		expect(slugOf('/story/el-aleph')).toBe('el-aleph');
	});
});
