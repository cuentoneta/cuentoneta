/**
 * El cruce del listado plano del catálogo contra su ACL.
 *
 * El agregado tiene dos mapeos de listado —la tarjeta del teaser y la fila del catálogo— y el cruce
 * del corpus de teasers ejercita solo el primero. Este es el que impide que el mapeo de
 * `fetchCatalog` y el crudo derivado de `literaryWorkCatalogQuery` diverjan en silencio. La
 * expectativa sale de proyectar el teaser de dominio, que es la vista hermana sobre los mismos
 * documentos, y no de repetir el mapeo crudo: por eso una omisión o un cambio de campo falla acá.
 */
import type { SanityClient } from '@sanity/client';
import { fn } from '@test-utils';

import { toCatalogEntry, type LiteraryWorkTeaser } from '@models/literary-work.model';
import { SanityLiteraryWorkRepository } from '../api/modules/literary-work/literary-work.repository.sanity';
import { onoffLiteraryWorkTeasersMock } from './onoff-literary-work-teasers.mock';
import { onoffRawLiteraryWorkCatalogMock } from './onoff-raw-literary-works.mock';

function repoReturning(raw: unknown): SanityLiteraryWorkRepository {
	const client = { fetch: fn(() => Promise.resolve(raw)) } as unknown as SanityClient;
	return new SanityLiteraryWorkRepository(client);
}

describe('el listado plano del catálogo coincide con el mapeo del ACL', () => {
	it.each(onoffRawLiteraryWorkCatalogMock.map(({ slug }) => slug))(
		'maps the raw catalog entry of "%s" into its domain projection',
		async (slug) => {
			const raw = onoffRawLiteraryWorkCatalogMock.find((entry) => entry.slug === slug);
			const expected = onoffLiteraryWorkTeasersMock.find((teaser) => teaser.slug === slug);
			const { literaryWorks } = await repoReturning([raw]).fetchCatalog();
			const [mapped] = literaryWorks;

			expect(mapped).toBeDefined();
			expect(expected).toBeDefined();
			expect(mapped).toEqual(toCatalogEntry(expected as LiteraryWorkTeaser));
		},
	);
});
