/**
 * El cruce del corpus de dominio del catálogo de obras contra su ACL. El porqué general está en el
 * spec homónimo de `LiteraryWork`: sin él, el mock de dominio podría afirmar una traducción que el
 * repository ya no hace.
 */
import type { SanityClient } from '@sanity/client';
import { fn } from '@test-utils';
import { SanityLiteraryWorkRepository } from '../api/modules/literary-work/literary-work.repository.sanity';
import { onoffLiteraryWorkCatalogMock } from './onoff-literary-work-catalog.mock';
import { onoffRawLiteraryWorkCatalogMock } from './onoff-raw-literary-works.mock';

function repoReturning(raw: unknown): SanityLiteraryWorkRepository {
	const client = { fetch: fn(() => Promise.resolve(raw)) } as unknown as SanityClient;
	return new SanityLiteraryWorkRepository(client);
}

describe('el corpus de dominio del catálogo de obras coincide con el mapeo del ACL', () => {
	it.each(onoffRawLiteraryWorkCatalogMock.map((raw) => raw.slug))(
		'maps the raw catalog entry of "%s" into its domain mock',
		async (slug) => {
			const raw = onoffRawLiteraryWorkCatalogMock.find((candidate) => candidate.slug === slug);
			const expected = onoffLiteraryWorkCatalogMock.find((entry) => entry.slug === slug);
			const { literaryWorks } = await repoReturning([raw]).fetchCatalog({});
			const [mapped] = literaryWorks;

			expect(mapped).toBeDefined();
			expect(mapped).toEqual(expected);
		},
	);
});
