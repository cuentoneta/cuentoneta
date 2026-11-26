/**
 * El cruce del corpus de dominio de las entradas del catálogo de obras contra su ACL. El porqué general
 * está en el spec homónimo de `LiteraryWork`; acá interesa que la traducción del catálogo es una ACL
 * aparte —su propia proyección y su propio mapeo— que ningún otro cruce ejercita.
 */
import type { SanityClient } from '@sanity/client';
import { fn } from '@test-utils';
import { stubImageUrlResolver } from '@testing/image-url-resolver.stub';
import { SanityLiteraryWorkRepository } from '../api/modules/literary-work/literary-work.repository.sanity';
import { onoffLiteraryWorkCatalogEntriesMock } from './onoff-literary-work-catalog-entries.mock';
import { onoffLiteraryWorksMock } from './onoff-literary-works.mock';
import { onoffRawLiteraryWorkCatalogEntriesMock } from './onoff-raw-literary-works.mock';

function repoReturning(raw: unknown): SanityLiteraryWorkRepository {
	const client = { fetch: fn(() => Promise.resolve(raw)) } as unknown as SanityClient;
	return new SanityLiteraryWorkRepository(client, stubImageUrlResolver);
}

describe('el corpus de dominio de las entradas del catálogo coincide con el mapeo del ACL', () => {
	it('maps the raw catalog listing into the domain entries, in the same order', async () => {
		const { catalogEntries, malformed } = await repoReturning(
			onoffRawLiteraryWorkCatalogEntriesMock,
		).fetchCatalogEntries();

		expect(malformed).toEqual([]);
		expect(catalogEntries).toEqual(onoffLiteraryWorkCatalogEntriesMock);
	});

	it.each(onoffRawLiteraryWorkCatalogEntriesMock.map((raw) => raw.slug))(
		'maps the raw catalog entry of "%s" into its domain mock',
		async (slug) => {
			const raw = onoffRawLiteraryWorkCatalogEntriesMock.find((candidate) => candidate.slug === slug);
			const expected = onoffLiteraryWorkCatalogEntriesMock.find((entry) => entry.slug === slug);

			const { catalogEntries } = await repoReturning([raw]).fetchCatalogEntries();

			expect(expected).toBeDefined();
			expect(catalogEntries).toEqual([expected]);
		},
	);

	it('covers the whole canon', () => {
		expect(onoffRawLiteraryWorkCatalogEntriesMock).toHaveLength(onoffLiteraryWorksMock.length);
		expect(onoffLiteraryWorkCatalogEntriesMock).toHaveLength(onoffLiteraryWorksMock.length);
	});
});
