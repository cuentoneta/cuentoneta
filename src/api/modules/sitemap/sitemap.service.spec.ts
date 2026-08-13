import { clearAllMocks, type Mock } from '@test-utils';
import { childElementSequences } from '@testing/sitemap-xml';
import * as sitemapRepository from './sitemap.repository';
import { generateSitemap, generateSitemapXml, getSitemapUrls } from './sitemap.service';

// Mock escapeXml with actual implementation
const escapeXml = (str: string): string => {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
};

/* eslint-disable no-restricted-syntax -- vi.mock/vi.fn: mock de módulo del repository; se migra a inyección de dependencias en #1503 */
vi.mock('./sitemap.repository', () => ({
	escapeXml: (str: string): string => {
		return str
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&apos;');
	},
	fetchSitemapSlugs: vi.fn(),
}));
/* eslint-enable no-restricted-syntax */

describe('SitemapService', () => {
	beforeEach(() => {
		clearAllMocks();
		process.env['BASE_URL'] = 'https://test.cuentoneta.ar';
	});

	afterEach(() => {
		delete process.env['BASE_URL'];
	});

	describe('escapeXml', () => {
		it('should escape ampersand', () => {
			expect(escapeXml('foo&bar')).toBe('foo&amp;bar');
		});

		it('should escape less than', () => {
			expect(escapeXml('foo<bar')).toBe('foo&lt;bar');
		});

		it('should escape greater than', () => {
			expect(escapeXml('foo>bar')).toBe('foo&gt;bar');
		});

		it('should escape double quotes', () => {
			expect(escapeXml('foo"bar')).toBe('foo&quot;bar');
		});

		it('should escape single quotes', () => {
			expect(escapeXml("foo'bar")).toBe('foo&apos;bar');
		});

		it('should escape multiple special characters', () => {
			expect(escapeXml('<test>&"value"</test>')).toBe('&lt;test&gt;&amp;&quot;value&quot;&lt;/test&gt;');
		});

		it('should return unchanged string without special characters', () => {
			expect(escapeXml('normal-slug-123')).toBe('normal-slug-123');
		});
	});

	describe('getSitemapUrls', () => {
		it('should return static pages', async () => {
			(sitemapRepository.fetchSitemapSlugs as Mock).mockResolvedValue({
				stories: [],
				authors: [],
				storylists: [],
			});

			const urls = await getSitemapUrls();

			expect(urls).toContainEqual({ loc: 'https://test.cuentoneta.ar' });
			expect(urls).toContainEqual({ loc: 'https://test.cuentoneta.ar/about' });
			expect(urls).toContainEqual({ loc: 'https://test.cuentoneta.ar/dmca' });
		});

		it('should include story URLs', async () => {
			(sitemapRepository.fetchSitemapSlugs as Mock).mockResolvedValue({
				stories: [{ slug: 'el-aleph', lastmod: '2025-01-01' }],
				authors: [],
				storylists: [],
			});

			const urls = await getSitemapUrls();

			expect(urls).toContainEqual({ loc: 'https://test.cuentoneta.ar/story/el-aleph', lastmod: '2025-01-01' });
		});

		it('should include author URLs', async () => {
			(sitemapRepository.fetchSitemapSlugs as Mock).mockResolvedValue({
				stories: [],
				authors: [{ slug: 'jorge-luis-borges', lastmod: '2025-01-02' }],
				storylists: [],
			});

			const urls = await getSitemapUrls();

			expect(urls).toContainEqual({
				loc: 'https://test.cuentoneta.ar/author/jorge-luis-borges',
				lastmod: '2025-01-02',
			});
		});

		it('should include storylist URLs', async () => {
			(sitemapRepository.fetchSitemapSlugs as Mock).mockResolvedValue({
				stories: [],
				authors: [],
				storylists: [{ slug: 'cuentos-de-terror', lastmod: '2025-01-03' }],
			});

			const urls = await getSitemapUrls();

			expect(urls).toContainEqual({
				loc: 'https://test.cuentoneta.ar/storylist/cuentos-de-terror',
				lastmod: '2025-01-03',
			});
		});

		it('should handle missing lastmod gracefully', async () => {
			(sitemapRepository.fetchSitemapSlugs as Mock).mockResolvedValue({
				stories: [{ slug: 'no-lastmod-story', lastmod: undefined }],
				authors: [],
				storylists: [],
			});

			const urls = await getSitemapUrls();

			const storyUrl = urls.find((u) => u.loc.includes('/story/no-lastmod-story'));
			expect(storyUrl?.lastmod).toBeUndefined();
		});

		it('should use default BASE_URL when env variable is not set', async () => {
			delete process.env['BASE_URL'];

			(sitemapRepository.fetchSitemapSlugs as Mock).mockResolvedValue({
				stories: [],
				authors: [],
				storylists: [],
			});

			const urls = await getSitemapUrls();

			expect(urls[0].loc).toBe('https://www.cuentoneta.ar');
		});

		// Los casos de arriba afirman que la URL de cada tipo está; ninguno, que estén todas. Sin eso, un
		// tipo entero puede caerse del sitemap sin que nada falle.
		it('should emit every slug of every type, with no duplicate locations', async () => {
			const entries = (prefix: string) =>
				['uno', 'dos', 'tres'].map((suffix) => ({ slug: `${prefix}-${suffix}`, lastmod: '2025-01-01' }));

			(sitemapRepository.fetchSitemapSlugs as Mock).mockResolvedValue({
				stories: entries('cuento'),
				authors: entries('autor'),
				storylists: entries('coleccion'),
			});

			const urls = await getSitemapUrls();

			expect(urls).toHaveLength(3 + 3 * 3);
			expect(new Set(urls.map(({ loc }) => loc)).size).toBe(urls.length);
		});
	});

	describe('generateSitemapXml', () => {
		it('should generate valid XML structure', async () => {
			const urls = [{ loc: 'https://example.com' }];

			const xml = await generateSitemapXml(urls);

			expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
			expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
			expect(xml).toContain('</urlset>');
		});

		it('should include URL entries with correct structure', async () => {
			const urls = [{ loc: 'https://example.com/page' }];

			const xml = await generateSitemapXml(urls);

			expect(xml).toContain('<url>');
			expect(xml).toContain('<loc>https://example.com/page</loc>');
			expect(xml).toContain('</url>');
		});

		it('should include lastmod when provided', async () => {
			const urls = [{ loc: 'https://example.com', lastmod: '2025-01-01' }];

			const xml = await generateSitemapXml(urls);

			expect(xml).toContain('<lastmod>2025-01-01</lastmod>');
		});

		it('should not include lastmod when not provided', async () => {
			const urls = [{ loc: 'https://example.com' }];

			const xml = await generateSitemapXml(urls);

			expect(xml).not.toContain('<lastmod>');
		});

		// El esquema define `tUrl` como `xsd:sequence`: un documento con los elementos correctos y el
		// orden cambiado es inválido, así que afirmar presencia no alcanza.
		it('should emit lastmod right after loc, as the schema sequence requires', async () => {
			const urls = [
				{ loc: 'https://example.com/con-fecha', lastmod: '2025-01-01' },
				{ loc: 'https://example.com/sin-fecha' },
			];

			const xml = await generateSitemapXml(urls);

			expect(childElementSequences(xml)).toEqual([['loc', 'lastmod'], ['loc']]);
		});

		it('should not emit the elements search engines ignore', async () => {
			const urls = [{ loc: 'https://example.com', lastmod: '2025-01-01' }];

			const xml = await generateSitemapXml(urls);

			expect(xml).not.toContain('<changefreq>');
			expect(xml).not.toContain('<priority>');
		});

		it('should produce well-formed XML', async () => {
			const urls = [{ loc: 'https://example.com/page?foo=1&bar=2', lastmod: '2025-01-01' }];

			const xml = await generateSitemapXml(urls);
			const parsed = new DOMParser().parseFromString(xml, 'text/xml');

			expect(parsed.querySelector('parsererror')).toBeNull();
			expect(parsed.querySelectorAll('url')).toHaveLength(1);
		});

		it('should escape special XML characters in URLs', async () => {
			const urls = [{ loc: 'https://example.com/page?foo=1&bar=2' }];

			const xml = await generateSitemapXml(urls);

			expect(xml).toContain('<loc>https://example.com/page?foo=1&amp;bar=2</loc>');
			expect(xml).not.toContain('&bar=');
		});

		// El valor lo constriñe el schema del CMS, no el backend: escaparlo es lo que hace que la
		// bien-formación del documento no dependa de una garantía externa.
		it('should escape special XML characters in lastmod', async () => {
			const urls = [{ loc: 'https://example.com', lastmod: '2025-01-01<script>' }];

			const xml = await generateSitemapXml(urls);

			expect(xml).toContain('<lastmod>2025-01-01&lt;script&gt;</lastmod>');
		});

		it('should handle multiple URLs', async () => {
			const urls = [{ loc: 'https://example.com/page1' }, { loc: 'https://example.com/page2' }];

			const xml = await generateSitemapXml(urls);

			expect(xml).toContain('<loc>https://example.com/page1</loc>');
			expect(xml).toContain('<loc>https://example.com/page2</loc>');
		});

		it('should handle empty URL array', async () => {
			const urls: { loc: string }[] = [];

			const xml = await generateSitemapXml(urls);

			expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
			expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
			expect(xml).toContain('</urlset>');
			expect(xml).not.toContain('<url>');
		});
	});

	describe('generateSitemap', () => {
		it('should combine getSitemapUrls and generateSitemapXml', async () => {
			(sitemapRepository.fetchSitemapSlugs as Mock).mockResolvedValue({
				stories: [{ slug: 'test-story', lastmod: '2025-01-01' }],
				authors: [],
				storylists: [],
			});

			const xml = await generateSitemap();

			expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
			expect(xml).toContain('<loc>https://test.cuentoneta.ar/story/test-story</loc>');
			expect(xml).toContain('<lastmod>2025-01-01</lastmod>');
		});
	});
});
