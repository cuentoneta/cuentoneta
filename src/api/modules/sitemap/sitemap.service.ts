// Repository
import { escapeXml, fetchSitemapSlugs } from './sitemap.repository';

interface SitemapUrl {
	loc: string;
	priority: string;
	changefreq: string;
	lastmod?: string;
}

/**
 * Obtiene todas las URLs para el sitemap
 */
export async function getSitemapUrls(): Promise<SitemapUrl[]> {
	const { stories, authors, storylists } = await fetchSitemapSlugs();
	const BASE_URL = process.env['BASE_URL'] || 'https://www.cuentoneta.ar';

	return [
		// Páginas estáticas
		{ loc: BASE_URL, priority: '1.0', changefreq: 'daily' },
		{ loc: `${BASE_URL}/about`, priority: '0.5', changefreq: 'monthly' },
		{ loc: `${BASE_URL}/dmca`, priority: '0.3', changefreq: 'yearly' },

		// Páginas de cuentos
		...stories.map((s) => ({
			loc: `${BASE_URL}/story/${s.slug}`,
			priority: '0.8',
			changefreq: 'weekly',
			lastmod: s.lastmod,
		})),

		// Páginas de autores
		...authors.map((a) => ({
			loc: `${BASE_URL}/author/${a.slug}`,
			priority: '0.7',
			changefreq: 'weekly',
			lastmod: a.lastmod,
		})),

		// Páginas de storylists
		...storylists.map((sl) => ({
			loc: `${BASE_URL}/storylist/${sl.slug}`,
			priority: '0.8',
			changefreq: 'weekly',
			lastmod: sl.lastmod,
		})),
	];
}

/**
 * Genera el XML del sitemap a partir de las URLs
 */
export async function generateSitemapXml(urls: SitemapUrl[]): Promise<string> {
	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}
  </url>`,
	)
	.join('\n')}
</urlset>`;
}

export async function generateSitemap(): Promise<string> {
	const urls = await getSitemapUrls();
	return generateSitemapXml(urls);
}
