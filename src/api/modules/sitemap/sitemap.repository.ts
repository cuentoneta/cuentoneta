// Sanity
import { client } from '../../_helpers/sanity-connector';

// Queries
import { sitemapSlugsQuery } from 'src/api/_queries/sitemap.query';

// Interfaces
interface SlugEntry {
	slug: string;
	lastmod?: string;
}

interface SitemapSlugsResult {
	stories: SlugEntry[];
	authors: SlugEntry[];
	storylists: SlugEntry[];
}

/**
 * Escapa caracteres especiales de XML para prevenir XML inválido
 */
export function escapeXml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/**
 * Formatea fecha ISO a formato W3C para sitemap (YYYY-MM-DD)
 */
function formatLastmod(date: string | undefined): string | undefined {
	if (!date) return undefined;
	return date.split('T')[0];
}

/**
 * Filtra entradas con slugs inválidos y formatea las fechas
 */
function processSlugEntries(
	entries: {
		slug: string;
		lastmod: string;
	}[],
): SlugEntry[] {
	return entries
		.filter((entry) => entry.slug)
		.map((entry) => ({
			slug: entry.slug,
			lastmod: formatLastmod(entry.lastmod),
		}));
}

export async function fetchSitemapSlugs(): Promise<SitemapSlugsResult> {
	const result = await client.fetch(sitemapSlugsQuery);

	return {
		stories: processSlugEntries(result.stories),
		authors: processSlugEntries(result.authors),
		storylists: processSlugEntries(result.storylists),
	};
}
