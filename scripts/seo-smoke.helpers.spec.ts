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
import { PAGE_REVISED_ON } from '@api/modules/sitemap/sitemap.lastmod';
import { shiftDays } from '@testing/date-shift';

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
	const paths = ['/literary-work/a', '/literary-work/b', '/author/c', '/collection/d'];

	it('filtra por prefijo de tipo', () => {
		expect(selectByType(paths, '/author/', 5, true)).toEqual(['/author/c']);
	});

	it('con full=true devuelve todos los del tipo', () => {
		expect(selectByType(paths, '/literary-work/', 1, true).sort()).toEqual(['/literary-work/a', '/literary-work/b']);
	});

	it('con full=false muestrea hasta size', () => {
		expect(selectByType(paths, '/literary-work/', 1, false)).toHaveLength(1);
	});
});

describe('expectationsFor', () => {
	it('read: patrón por slug + JSON-LD Article y breadcrumb-read + enlace a autor', () => {
		const expectations = expectationsFor('/literary-work/el-fin');
		expect(expectations?.titlePattern?.test('El fin')).toBe(true);
		expect(expectations?.h1Pattern?.test('El fin')).toBe(true);
		expect(expectations?.canonicalContains).toBe('/literary-work/el-fin');
		expect(expectations?.requiredInternalLinkPrefix).toBe('/author/');
		expect(expectations?.requiredJsonLdIds).toContain('article');
		expect(expectations?.requiredJsonLdIds).toContain('breadcrumb-literary-work');
	});

	it('author: patrón por slug + ProfilePage + enlace a obra', () => {
		const expectations = expectationsFor('/author/jorge-luis-borges');
		expect(expectations?.titlePattern?.test('Jorge Luis Borges')).toBe(true);
		expect(expectations?.requiredInternalLinkPrefix).toBe('/literary-work/');
		expect(expectations?.requiredJsonLdIds).toContain('profile-page');
	});

	it('collection: sin titlePattern (título editorial) + CollectionPage', () => {
		const expectations = expectationsFor('/collection/verano-2022');
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

	describe('con revisiones de página declaradas', () => {
		const batch = (prefix: string, count: number, date: string) =>
			Array.from({ length: count }, (_, index) => urlEntry(`${prefix}lote-${index}`, date));

		const revisedPages = [
			['/author/', PAGE_REVISED_ON.author],
			['/collection/', PAGE_REVISED_ON.collection],
		] as const;

		it.each(revisedPages)('no mide las páginas %s fechadas en su revisión', (prefix, revision) => {
			const report = collectSitemapViolations(sitemapOf([...batch(prefix, 34, revision), ...spread(66)]));

			expect(report.violations).toEqual([]);
			expect(report.exempted).toBe(34);
			expect(report.dated).toBe(100);
		});

		// La exención es del tipo de página, no de la fecha: la misma fecha en otro tipo es un lote.
		it('reporta la fecha de una revisión concentrada en las obras', () => {
			const report = collectSitemapViolations(
				sitemapOf([...batch('/literary-work/', 48, PAGE_REVISED_ON.author), ...spread(52)]),
			);

			expect(report.exempted).toBe(0);
			expect(report.largestCluster).toEqual({ date: PAGE_REVISED_ON.author, share: 0.48 });
			expect(report.violations[0]).toContain('escritura en lote');
		});

		it.each(revisedPages)('reporta un lote de páginas %s en una fecha no declarada', (prefix, revision) => {
			const undeclared = shiftDays(revision, 1);

			const report = collectSitemapViolations(sitemapOf([...batch(prefix, 48, undeclared), ...spread(52)]));

			expect(report.largestCluster).toEqual({ date: undeclared, share: 0.48 });
			expect(report.violations[0]).toContain('escritura en lote');
		});

		// Sin las exentas, el resto se mide solo: un lote que en el total pesaría poco sigue pesando lo suyo.
		it('mide la concentración sobre las fechas que quedan', () => {
			const batchDay = shiftDays(PAGE_REVISED_ON.author, -1);

			const report = collectSitemapViolations(
				sitemapOf([
					...batch('/author/', 50, PAGE_REVISED_ON.author),
					...batch('/literary-work/', 15, batchDay),
					...spread(35),
				]),
			);

			expect(report.largestCluster).toEqual({ date: batchDay, share: 0.3 });
			expect(report.violations).toHaveLength(1);
		});

		it('no reporta concentración cuando todas las fechas están exentas', () => {
			const report = collectSitemapViolations(sitemapOf(batch('/author/', 10, PAGE_REVISED_ON.author)));

			expect(report.largestCluster).toBeNull();
			expect(report.violations).toEqual([]);
		});
	});
});
