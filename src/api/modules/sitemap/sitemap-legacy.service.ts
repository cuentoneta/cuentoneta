import { fetchLegacySitemapSlugs } from './sitemap-legacy.repository';
import { deduplicateByLocation, generateSitemapXml, sitemapBaseUrl, type SitemapUrl } from './sitemap.service';

/**
 * URLs viejas de las obras y colecciones migradas, para que el buscador las vuelva a rastrear y registre
 * su redirección. No llevan `lastmod`: la fecha del documento migrado no dice nada de la URL vieja.
 *
 * El slug se codifica porque un slug viejo puede tener caracteres que la regla vigente ya no admite.
 */
export async function getLegacySitemapUrls(
	fetchSlugs: typeof fetchLegacySitemapSlugs = fetchLegacySitemapSlugs,
): Promise<SitemapUrl[]> {
	const { stories, storylists } = await fetchSlugs();
	const baseUrl = sitemapBaseUrl();

	return deduplicateByLocation([
		...stories.map((slug) => ({ loc: `${baseUrl}/story/${encodeURIComponent(slug)}` })),
		...storylists.map((slug) => ({ loc: `${baseUrl}/storylist/${encodeURIComponent(slug)}` })),
	]);
}

export async function generateLegacySitemap(): Promise<string> {
	return generateSitemapXml(await getLegacySitemapUrls());
}
