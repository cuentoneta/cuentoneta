// Repository
import { escapeXml, fetchSitemapSlugs } from './sitemap.repository';

// Sin `changefreq` ni `priority`: los buscadores los ignoran de forma declarada.
interface SitemapUrl {
	loc: string;
	lastmod?: string;
}

/**
 * Deja una sola entrada por ubicación, conservando la primera.
 *
 * Dos documentos publicados pueden compartir slug —el dataset no lo impide—, y entonces resuelven a
 * la misma ruta. Anunciar esa URL dos veces no agrega nada y le pide al buscador que decida cuál de
 * las dos fechas vale; qué documento sirve la página es un problema del contenido, no algo que el
 * sitemap pueda arbitrar.
 *
 * «La primera» es contractual y no accidental: las queries ordenan por identificador, que es el mismo
 * criterio con el que la página elige cuál servir. El descarte se registra porque es la única señal
 * de que el dataset tiene dos documentos disputando una URL.
 */
function deduplicateByLocation(urls: SitemapUrl[]): SitemapUrl[] {
	const byLocation = new Map<string, SitemapUrl>();
	const discarded: string[] = [];
	for (const url of urls) {
		if (byLocation.has(url.loc)) {
			discarded.push(url.loc);
			continue;
		}
		byLocation.set(url.loc, url);
	}
	if (discarded.length > 0) {
		console.warn('[Sitemap] se descartan ubicaciones repetidas: dos documentos publicados comparten slug', {
			locations: discarded,
		});
	}
	return [...byLocation.values()];
}

/**
 * Obtiene todas las URLs para el sitemap
 */
export async function getSitemapUrls(): Promise<SitemapUrl[]> {
	const { literaryWorks, authors, collections } = await fetchSitemapSlugs();
	const BASE_URL = process.env['BASE_URL'] || 'https://www.cuentoneta.ar';

	return deduplicateByLocation([
		// Páginas estáticas
		{ loc: BASE_URL },
		{ loc: `${BASE_URL}/about` },
		{ loc: `${BASE_URL}/dmca` },
		{ loc: `${BASE_URL}/collection` },
		{ loc: `${BASE_URL}/literary-work` },

		// Páginas de obras
		...literaryWorks.map((lw) => ({ loc: `${BASE_URL}/read/${lw.slug}`, lastmod: lw.lastmod })),

		// Páginas de autores
		...authors.map((a) => ({ loc: `${BASE_URL}/author/${a.slug}`, lastmod: a.lastmod })),

		// Páginas de colecciones
		...collections.map((c) => ({ loc: `${BASE_URL}/collection/${c.slug}`, lastmod: c.lastmod })),
	]);
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
    <loc>${escapeXml(url.loc)}</loc>${url.lastmod ? `\n    <lastmod>${escapeXml(url.lastmod)}</lastmod>` : ''}
  </url>`,
	)
	.join('\n')}
</urlset>`;
}

export async function generateSitemap(): Promise<string> {
	const urls = await getSitemapUrls();
	return generateSitemapXml(urls);
}
