import { evaluate, parse } from 'groq-js';
import { fn, restoreAllMocks, spyOn } from '@test-utils';
import { onoffDatasetMock } from '@mocks/onoff-documents.mock';
import { migratedCollectionSlugQuery, migratedLiteraryWorkSlugQuery } from '@queries/legacy-route.query';
import { legacySitemapSlugsQuery } from '@queries/sitemap-legacy.query';
import { legacyMigrationDocuments, legacyMigrationPairs } from '@testing/legacy-migration.scenario';
import { locations } from '@testing/sitemap-xml';
import { MIGRATED_ID_PREFIX } from '../legacy-route/legacy-route.constants';
import type { fetchLegacySitemapSlugs, LegacySitemapSlugs } from './sitemap-legacy.repository';
import { getLegacySitemapUrls } from './sitemap-legacy.service';
import { generateSitemapXml, sitemapBaseUrl } from './sitemap.service';

const stubFetchSlugs = (slugs: LegacySitemapSlugs) =>
	fn<typeof fetchLegacySitemapSlugs>(() => Promise.resolve(slugs));

const DATASET = [...onoffDatasetMock, ...legacyMigrationDocuments];

async function evaluateOnCorpus(query: string, params: Record<string, unknown>): Promise<unknown> {
	return (await evaluate(parse(query), { dataset: DATASET, params })).get();
}

describe('getLegacySitemapUrls', () => {
	afterEach(() => {
		restoreAllMocks();
	});

	it('lists the legacy route of every origin, without lastmod', async () => {
		const urls = await getLegacySitemapUrls(stubFetchSlugs({ stories: ['el-fin'], storylists: ['verano-2022'] }));

		expect(urls).toEqual([
			{ loc: `${sitemapBaseUrl()}/story/el-fin` },
			{ loc: `${sitemapBaseUrl()}/storylist/verano-2022` },
		]);
	});

	it('encodes a legacy slug that carries characters a route cannot hold as-is', async () => {
		const urls = await getLegacySitemapUrls(stubFetchSlugs({ stories: ['IcyFox', 'a/b&c'], storylists: [] }));

		expect(urls.map(({ loc }) => loc)).toEqual([
			`${sitemapBaseUrl()}/story/IcyFox`,
			`${sitemapBaseUrl()}/story/a%2Fb%26c`,
		]);
	});

	it('keeps a single entry, and reports it, when two origins share a slug', async () => {
		const warn = spyOn(console, 'warn').mockImplementation(() => undefined);

		const urls = await getLegacySitemapUrls(stubFetchSlugs({ stories: ['el-fin', 'el-fin'], storylists: [] }));

		expect(urls).toHaveLength(1);
		expect(warn).toHaveBeenCalledOnce();
	});

	it('renders well-formed XML whose locations are the legacy routes', async () => {
		const urls = await getLegacySitemapUrls(stubFetchSlugs({ stories: ['a/b&c'], storylists: ['verano-2022'] }));

		const xml = await generateSitemapXml(urls);

		expect(new DOMParser().parseFromString(xml, 'application/xml').querySelector('parsererror')).toBeNull();
		expect(locations(xml)).toEqual(urls.map(({ loc }) => loc));
	});

	// Cierra, sin red, el criterio de que cada URL publicada lleve a su documento: lo que el sitemap anuncia
	// y lo que el 301 resuelve salen de queries distintas, y tienen que coincidir.
	it('announces only legacy routes that the redirect resolves to the document migrated from them', async () => {
		const legacy = (await evaluateOnCorpus(legacySitemapSlugsQuery, {
			storyPrefix: MIGRATED_ID_PREFIX.story,
			storylistPrefix: MIGRATED_ID_PREFIX.storylist,
		})) as { stories: { legacySlug: string }[]; storylists: { legacySlug: string }[] };
		const announced = [
			...legacy.stories.map(({ legacySlug }) => ({ kind: 'story' as const, legacySlug })),
			...legacy.storylists.map(({ legacySlug }) => ({ kind: 'storylist' as const, legacySlug })),
		];
		const queryByKind = { story: migratedLiteraryWorkSlugQuery, storylist: migratedCollectionSlugQuery };

		expect(announced).toHaveLength(legacyMigrationPairs.length);
		for (const { kind, legacySlug } of announced) {
			const pair = legacyMigrationPairs.find((candidate) => candidate.origin.slug.current === legacySlug);
			const resolved = await evaluateOnCorpus(queryByKind[kind], {
				legacySlug,
				migratedIdPrefix: MIGRATED_ID_PREFIX[kind],
			});
			expect(resolved).toBe(pair?.migrated.slug.current);
		}
	});
});
