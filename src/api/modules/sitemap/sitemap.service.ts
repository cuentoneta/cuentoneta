// Repository
import { escapeXml, fetchSitemapSlugs } from './sitemap.repository';

// Sin `changefreq` ni `priority`: Google los ignora de forma declarada y acá además valían una
// constante por tipo, así que no discriminaban nada entre las URLs del sitio.
interface SitemapUrl {
	loc: string;
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
		{ loc: BASE_URL },
		{ loc: `${BASE_URL}/about` },
		{ loc: `${BASE_URL}/dmca` },

		// Páginas de cuentos
		...stories.map((s) => ({ loc: `${BASE_URL}/story/${s.slug}`, lastmod: s.lastmod })),

		// Páginas de autores
		...authors.map((a) => ({ loc: `${BASE_URL}/author/${a.slug}`, lastmod: a.lastmod })),

		// Páginas de storylists
		...storylists.map((sl) => ({ loc: `${BASE_URL}/storylist/${sl.slug}`, lastmod: sl.lastmod })),
	];
}

/**
 * Genera el XML del sitemap a partir de las URLs
 *
 * El orden de los elementos hijos no es libre: el esquema de sitemaps.org define `tUrl` como una
 * secuencia, así que `lastmod` va después de `loc` y no en cualquier posición.
 */
export async function generateSitemapXml(urls: SitemapUrl[]): Promise<string> {
	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}
  </url>`,
	)
	.join('\n')}
</urlset>`;
}

export async function generateSitemap(): Promise<string> {
	const urls = await getSitemapUrls();
	return generateSitemapXml(urls);
}
