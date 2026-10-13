import type { SanityClient } from '@sanity/client';
import { evaluate, parse } from 'groq-js';
import { fn } from '@test-utils';
import { onoffDatasetMock } from '@mocks/onoff-documents.mock';
import { migratedCollectionSlugQuery, migratedLiteraryWorkSlugQuery } from '@queries/legacy-route.query';
import { legacyMigrationDocuments, legacyMigrationPairs } from '@testing/legacy-migration.scenario';
import { MIGRATED_ID_PREFIX } from './legacy-route.constants';
import { fetchMigratedSlug } from './legacy-route.repository';

const QUERY_BY_KIND = { story: migratedLiteraryWorkSlugQuery, storylist: migratedCollectionSlugQuery } as const;

// El cliente responde lo mismo que Sanity: la query real evaluada sobre el corpus con los parámetros que
// el repository le pasó, así el spec no inventa la forma cruda ni el criterio de resolución.
function sanityAnsweringFromCorpus() {
	const fetch = fn(async (query: string, params: Record<string, unknown>) => {
		const dataset = [...onoffDatasetMock, ...legacyMigrationDocuments];
		return (await evaluate(parse(query), { dataset, params })).get();
	});
	return { client: { fetch } as unknown as SanityClient, fetch };
}

describe('fetchMigratedSlug', () => {
	it.each(legacyMigrationPairs.map((pair) => [pair.kind, pair.origin.slug.current, pair] as const))(
		'asks the %s query for the document migrated from %s',
		async (kind, legacySlug, { migrated }) => {
			const { client, fetch } = sanityAnsweringFromCorpus();

			expect(await fetchMigratedSlug(kind, legacySlug, client)).toBe(migrated.slug.current);
			expect(fetch).toHaveBeenCalledWith(QUERY_BY_KIND[kind], {
				legacySlug,
				migratedIdPrefix: MIGRATED_ID_PREFIX[kind],
			});
		},
	);

	it('returns null when no migrated document comes from that slug', async () => {
		const { client } = sanityAnsweringFromCorpus();

		expect(await fetchMigratedSlug('story', 'onoff-sin-origen', client)).toBeNull();
	});
});
