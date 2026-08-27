import {
	checkSitewideAbsoluteUrls,
	collectSitemapViolations,
	expectationsFor,
	parseSitemap,
	sample,
	selectByType,
	slugOf,
	slugToTitlePattern,
	toPath,
} from './seo-smoke.helpers';

function sitewideHtml(organizationUrl: string, websiteUrl: string): string {
	return (
		`<script data-schema-id="organization">{"@type":"Organization","name":"La Cuentoneta","url":"${organizationUrl}"}</script>` +
		`<script data-schema-id="website">{"@type":"WebSite","name":"La Cuentoneta","url":"${websiteUrl}"}</script>`
	);
}

describe('checkSitewideAbsoluteUrls', () => {
	it('no viola cuando organization y website exponen una url absoluta', () => {
		expect(checkSitewideAbsoluteUrls(sitewideHtml('https://www.cuentoneta.ar', 'https://www.cuentoneta.ar'))).toEqual(
			[],
		);
	});

	it('viola por cada entidad sitewide con url vacía o relativa (base mal configurada en el deploy)', () => {
		const violations = checkSitewideAbsoluteUrls(sitewideHtml('', '/'));

		expect(violations).toHaveLength(2);
		expect(violations.join(' ')).toContain('organization');
		expect(violations.join(' ')).toContain('website');
	});

	it('no tira ante JSON-LD malformado (lo reporta la validación estructural, no este check)', () => {
		expect(checkSitewideAbsoluteUrls('<script data-schema-id="organization">{ roto }</script>')).toEqual([]);
	});
});

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
	const paths = ['/story/a', '/story/b', '/author/c', '/collection/d'];

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

	it('read: patrón por slug + JSON-LD Article y breadcrumb-read + enlace a autor', () => {
		const expectations = expectationsFor('/read/el-fin');
		expect(expectations?.titlePattern?.test('El fin')).toBe(true);
		expect(expectations?.h1Pattern?.test('El fin')).toBe(true);
		expect(expectations?.canonicalContains).toBe('/read/el-fin');
		expect(expectations?.requiredInternalLinkPrefix).toBe('/author/');
		expect(expectations?.requiredJsonLdIds).toContain('article');
		expect(expectations?.requiredJsonLdIds).toContain('breadcrumb-read');
	});

	it('author: patrón por slug + ProfilePage + enlace a cuento', () => {
		const expectations = expectationsFor('/author/jorge-luis-borges');
		expect(expectations?.titlePattern?.test('Jorge Luis Borges')).toBe(true);
		expect(expectations?.requiredInternalLinkPrefix).toBe('/story/');
		expect(expectations?.requiredJsonLdIds).toContain('profile-page');
	});

	it('collection: sin titlePattern (título editorial) + CollectionPage', () => {
		const expectations = expectationsFor('/collection/verano-2022');
		expect(expectations?.titlePattern).toBeUndefined();
		expect(expectations?.requiredJsonLdIds).toContain('collection-page');
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

describe('collectSitemapViolations', () => {
	const urlEntry = (path: string, lastmod?: string) =>
		`<url><loc>https://www.cuentoneta.ar${path}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`;

	const sitemapOf = (entries: string[]) => `<?xml version="1.0" encoding="UTF-8"?><urlset>${entries.join('')}</urlset>`;

	// Fechas dispersas: una por entrada, ninguna concentrada.
	const spread = (count: number) =>
		Array.from({ length: count }, (_, index) =>
			urlEntry(`/story/obra-${index}`, `2025-01-${`${index + 1}`.padStart(2, '0')}`),
		);

	it('no reporta nada para un sitemap con fechas dispersas y en secuencia', () => {
		const report = collectSitemapViolations(sitemapOf([urlEntry('/'), ...spread(9)]));

		expect(report.violations).toEqual([]);
		expect(report.urls).toBe(10);
		expect(report.dated).toBe(9);
		expect(report.distinctDates).toBe(9);
	});

	// La proporción del caso es la que servía producción cuando el `lastmod` derivaba de la fecha de
	// escritura: el chequeo no sirve de nada si no marca ese estado.
	it('reporta una fecha concentrada en casi la mitad del corpus', () => {
		const clustered = Array.from({ length: 48 }, (_, index) => urlEntry(`/story/lote-${index}`, '2026-06-29'));

		const report = collectSitemapViolations(sitemapOf([...clustered, ...spread(52)]));

		expect(report.largestCluster).toEqual({ date: '2026-06-29', share: 0.48 });
		expect(report.violations).toHaveLength(1);
		expect(report.violations[0]).toContain('escritura en lote');
	});

	it('reporta la fecha emitida antes de la ubicación', () => {
		const inverted = '<url><lastmod>2025-01-01</lastmod><loc>https://www.cuentoneta.ar/story/a</loc></url>';

		const report = collectSitemapViolations(sitemapOf([inverted, ...spread(9)]));

		expect(report.violations).toHaveLength(1);
		expect(report.violations[0]).toContain('secuencia');
	});

	it('reporta los elementos que los buscadores ignoran', () => {
		const withIgnored =
			'<url><loc>https://www.cuentoneta.ar/story/a</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>';

		const report = collectSitemapViolations(sitemapOf([withIgnored, ...spread(9)]));

		expect(report.violations.filter((violation) => violation.includes('ignoran'))).toHaveLength(2);
	});

	it('reporta un sitemap sin entradas', () => {
		const report = collectSitemapViolations(sitemapOf([]));

		expect(report.violations).toEqual(['El sitemap no expone ninguna entrada <url>.']);
		expect(report.largestCluster).toBeNull();
	});
});
