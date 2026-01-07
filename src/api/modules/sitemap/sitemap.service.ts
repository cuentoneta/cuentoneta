// Repository
import { fetchSitemapSlugs } from './sitemap.repository';

interface SitemapUrl {
	loc: string;
	priority: string;
	changefreq: string;
}

/**
 * Obtiene todas las URLs para el sitemap
 */
export async function getSitemapUrls(): Promise<SitemapUrl[]> {
	const { stories, authors, storylists } = await fetchSitemapSlugs();
	const BASE_URL = process.env['BASE_URL'] || 'https://cuentoneta.ar';

	return [
		// Páginas estáticas
		{ loc: BASE_URL, priority: '1.0', changefreq: 'daily' },
		{ loc: `${BASE_URL}/about`, priority: '0.5', changefreq: 'monthly' },
		{ loc: `${BASE_URL}/authors`, priority: '0.7', changefreq: 'weekly' },
		{ loc: `${BASE_URL}/dmca`, priority: '0.3', changefreq: 'yearly' },

		// Páginas de cuentos
		...stories.map((s) => ({
			loc: `${BASE_URL}/story/${s.slug}`,
			priority: '0.8',
			changefreq: 'weekly',
		})),

		// Páginas de autores
		...authors.map((a) => ({
			loc: `${BASE_URL}/author/${a.slug}`,
			priority: '0.7',
			changefreq: 'weekly',
		})),

		// Páginas de storylists
		...storylists.map((sl) => ({
			loc: `${BASE_URL}/storylist/${sl.slug}`,
			priority: '0.8',
			changefreq: 'weekly',
		})),
	];
}

/**
 * Genera el XML del sitemap a partir de las URLs
 */
export function generateSitemapXml(urls: SitemapUrl[]): string {
	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(url) => `  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
	)
	.join('\n')}
</urlset>`;
}
