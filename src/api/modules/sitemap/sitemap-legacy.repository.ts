import type { SanityClient } from '@sanity/client';
import { client } from '../../_helpers/sanity-connector';
import { legacySitemapSlugsQuery } from '@queries/sitemap-legacy.query';
import { MIGRATED_ID_PREFIX } from '../legacy-route/legacy-route.constants';

export interface LegacySitemapSlugs {
	stories: string[];
	storylists: string[];
}

/**
 * Descarta las entradas cuyo origen no se encontró, que son la única señal de un documento migrado que
 * perdió el suyo. No filtra por la regla vigente del slug: la ruta vieja es la que el origen tenía, la
 * cumpla o no.
 */
function presentSlugs(entries: { legacySlug: string | null }[], kind: string): string[] {
	const slugs = entries.map(({ legacySlug }) => legacySlug).filter((slug): slug is string => !!slug);
	if (slugs.length < entries.length) {
		console.warn('[SitemapLegacy] se descartan documentos migrados cuyo origen no está en el dataset', {
			kind,
			discarded: entries.length - slugs.length,
		});
	}
	return slugs;
}

/** Slugs de origen de las obras y colecciones migradas, en orden de `_id` del migrado. */
export async function fetchLegacySitemapSlugs(sanityClient: SanityClient = client): Promise<LegacySitemapSlugs> {
	const result = await sanityClient.fetch(legacySitemapSlugsQuery, {
		storyPrefix: MIGRATED_ID_PREFIX.story,
		storylistPrefix: MIGRATED_ID_PREFIX.storylist,
	});

	return {
		stories: presentSlugs(result.stories, 'story'),
		storylists: presentSlugs(result.storylists, 'storylist'),
	};
}
