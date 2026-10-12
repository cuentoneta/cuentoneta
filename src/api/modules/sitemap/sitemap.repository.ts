// Sanity
import { client } from '../../_helpers/sanity-connector';

// Queries
import { sitemapSlugsQuery } from '@queries/sitemap.query';

import { isSlug } from '@models/slug.model';

// Interfaces
interface SlugEntry {
	slug: string;
	lastmod?: string;
}

interface SitemapSlugsResult {
	literaryWorks: SlugEntry[];
	authors: SlugEntry[];
	collections: SlugEntry[];
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
 * Descarta las entradas cuyo slug el dominio no puede construir y formatea las fechas. Es la guarda que
 * completa la poda de la query, que no puede expresar el alfabeto del slug.
 */
function processSlugEntries(
	entries: {
		slug: string | null;
		lastmod: string;
	}[],
): SlugEntry[] {
	return entries
		.filter((entry): entry is { slug: string; lastmod: string } => isSlug(entry.slug))
		.map((entry) => ({
			slug: entry.slug,
			lastmod: formatLastmod(entry.lastmod),
		}));
}

export async function fetchSitemapSlugs(): Promise<SitemapSlugsResult> {
	const result = await client.fetch(sitemapSlugsQuery);

	return {
		literaryWorks: processSlugEntries(result.literaryWorks),
		authors: processSlugEntries(result.authors),
		collections: processSlugEntries(result.collections),
	};
}
