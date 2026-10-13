import { evaluate, parse } from 'groq-js';
import { restoreAllMocks, spyOn } from '@test-utils';
import { onoffDatasetMock } from '@mocks/onoff-documents.mock';
import { legacySitemapSlugsQuery } from '@queries/sitemap-legacy.query';
import { legacyMigrationDocuments, legacyMigrationPairs } from '@testing/legacy-migration.scenario';
import { stubSanityClient } from '@testing/sanity-client.stub';
import { MIGRATED_ID_PREFIX } from '../legacy-route/legacy-route.constants';
import { fetchLegacySitemapSlugs } from './sitemap-legacy.repository';

const PARAMS = { storyPrefix: MIGRATED_ID_PREFIX.story, storylistPrefix: MIGRATED_ID_PREFIX.storylist };

// El cliente responde lo mismo que Sanity: la query real evaluada sobre los documentos.
async function sanityAnswering(dataset: unknown[]) {
	const result = await (await evaluate(parse(legacySitemapSlugsQuery), { dataset, params: PARAMS })).get();
	return stubSanityClient([[legacySitemapSlugsQuery, result]]);
}

const originSlugs = (kind: 'story' | 'storylist') =>
	legacyMigrationPairs.filter((pair) => pair.kind === kind).map(({ origin }) => origin.slug.current);

describe('fetchLegacySitemapSlugs', () => {
	afterEach(() => {
		restoreAllMocks();
	});

	it('asks for the origins with the provenance prefixes', async () => {
		const { client, fetch } = await sanityAnswering([...onoffDatasetMock, ...legacyMigrationDocuments]);

		await fetchLegacySitemapSlugs(client);

		expect(fetch).toHaveBeenCalledWith(legacySitemapSlugsQuery, PARAMS);
	});

	// Un slug viejo que la regla vigente ya no construye sigue siendo la URL que el buscador conoce.
	it('keeps legacy slugs the current slug rule would reject', async () => {
		const { client } = await sanityAnswering([...onoffDatasetMock, ...legacyMigrationDocuments]);

		const { stories, storylists } = await fetchLegacySitemapSlugs(client);

		expect(stories.sort()).toEqual(originSlugs('story').sort());
		expect(storylists).toEqual(originSlugs('storylist'));
	});

	it('drops, and reports, a migrated document whose origin is gone', async () => {
		const warn = spyOn(console, 'warn').mockImplementation(() => undefined);
		const [orphan, ...rest] = legacyMigrationPairs;
		const { client } = await sanityAnswering([orphan.migrated, ...rest.flatMap(({ origin, migrated }) => [origin, migrated])]);

		const { stories } = await fetchLegacySitemapSlugs(client);

		expect(stories).not.toContain(orphan.origin.slug.current);
		expect(stories).toHaveLength(originSlugs('story').length - 1);
		expect(warn).toHaveBeenCalledOnce();
	});
});
