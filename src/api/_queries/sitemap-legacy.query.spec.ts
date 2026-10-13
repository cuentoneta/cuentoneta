import { evaluate, parse } from 'groq-js';
import { onoffDatasetMock } from '@mocks/onoff-documents.mock';
import { MIGRATED_ID_PREFIX } from '@api/modules/legacy-route/legacy-route.constants';
import { legacyMigrationDocuments, legacyMigrationPairs } from '@testing/legacy-migration.scenario';
import { legacySitemapSlugsQuery } from './sitemap-legacy.query';

interface LegacySitemapSlugs {
	stories: { legacySlug: string | null }[];
	storylists: { legacySlug: string | null }[];
}

async function run(dataset: unknown[]): Promise<LegacySitemapSlugs> {
	const params = { storyPrefix: MIGRATED_ID_PREFIX.story, storylistPrefix: MIGRATED_ID_PREFIX.storylist };
	return (await (await evaluate(parse(legacySitemapSlugsQuery), { dataset, params })).get()) as LegacySitemapSlugs;
}

const KEY_BY_KIND = { story: 'stories', storylist: 'storylists' } as const;

const slugsOf = (entries: { legacySlug: string | null }[]) => entries.map(({ legacySlug }) => legacySlug);

describe('legacySitemapSlugsQuery', () => {
	// Las URLs viejas nombran el slug del origen, no el que el documento tiene hoy.
	it('projects the slug of the origin of every migrated document, and only those', async () => {
		const result = await run([...onoffDatasetMock, ...legacyMigrationDocuments]);

		for (const kind of ['story', 'storylist'] as const) {
			const expected = legacyMigrationPairs.filter((pair) => pair.kind === kind).map(({ origin }) => origin.slug.current);
			expect(slugsOf(result[KEY_BY_KIND[kind]]).sort()).toEqual(expected.sort());
		}
	});

	it('projects null for a migrated document whose origin is gone', async () => {
		const migratedOnly = legacyMigrationPairs.map(({ migrated }) => migrated);

		const result = await run(migratedOnly);

		expect([...slugsOf(result.stories), ...slugsOf(result.storylists)].every((slug) => slug === null)).toBe(true);
	});

	it('leaves drafts of migrated documents out', async () => {
		const drafts = legacyMigrationPairs.flatMap(({ origin, migrated }) => [
			origin,
			{ ...migrated, _id: `drafts.${migrated._id}` },
		]);

		const result = await run(drafts);

		expect(result.stories).toEqual([]);
		expect(result.storylists).toEqual([]);
	});
});
