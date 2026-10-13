import type { SanityClient } from '@sanity/client';
import { client } from '../../_helpers/sanity-connector';
import { migratedCollectionSlugQuery, migratedLiteraryWorkSlugQuery } from '@queries/legacy-route.query';
import { MIGRATED_ID_PREFIX } from './legacy-route.constants';

export type LegacyRouteKind = keyof typeof MIGRATED_ID_PREFIX;

/**
 * Slug vigente del documento migrado desde el origen cuyo slug era `legacySlug`, o `null` si ningún
 * documento migrado proviene de un origen con ese slug.
 */
export function fetchMigratedSlug(
	kind: LegacyRouteKind,
	legacySlug: string,
	sanityClient: SanityClient = client,
): Promise<string | null> {
	const migratedSlugQuery = { story: migratedLiteraryWorkSlugQuery, storylist: migratedCollectionSlugQuery }[kind];
	return sanityClient.fetch(migratedSlugQuery, { legacySlug, migratedIdPrefix: MIGRATED_ID_PREFIX[kind] });
}
