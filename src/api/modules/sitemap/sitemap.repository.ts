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

// Una página que lista obras. Su `lastmod` lo resuelve el service a partir de la fecha de la más
// reciente, que queda `undefined` si no lista ninguna.
interface ListingSlugEntry {
	slug: string;
	latestLiteraryWorkDate?: string;
}

interface SitemapSlugsResult {
	literaryWorks: SlugEntry[];
	authors: ListingSlugEntry[];
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
function formatLastmod(date: string | null | undefined): string | undefined {
	if (!date) return undefined;
	return date.split('T')[0];
}

/**
 * Descarta las entradas cuyo slug el dominio no puede construir. Es la guarda que completa la poda de la
 * query, que no puede expresar el alfabeto del slug.
 */
function withBuildableSlug<T extends { slug: string | null }>(entries: T[]): (T & { slug: string })[] {
	return entries.filter((entry): entry is T & { slug: string } => isSlug(entry.slug));
}

function processSlugEntries(entries: { slug: string | null; lastmod: string }[]): SlugEntry[] {
	return withBuildableSlug(entries).map((entry) => ({
		slug: entry.slug,
		lastmod: formatLastmod(entry.lastmod),
	}));
}

function processListingSlugEntries(
	entries: { slug: string | null; latestLiteraryWorkAt: string | null }[],
): ListingSlugEntry[] {
	return withBuildableSlug(entries).map((entry) => ({
		slug: entry.slug,
		latestLiteraryWorkDate: formatLastmod(entry.latestLiteraryWorkAt),
	}));
}

export async function fetchSitemapSlugs(): Promise<SitemapSlugsResult> {
	const result = await client.fetch(sitemapSlugsQuery);

	return {
		literaryWorks: processSlugEntries(result.literaryWorks),
		authors: processListingSlugEntries(result.authors),
		collections: processSlugEntries(result.collections),
	};
}
