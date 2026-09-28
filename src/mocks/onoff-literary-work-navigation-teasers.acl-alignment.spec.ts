/**
 * El cruce del listado sin filtros del catálogo contra su ACL.
 *
 * La vista de navegación con autores la producen dos repositorios —el de contenido para la landing y
 * el de obras para este listado—, y el cruce de la landing ejercita solo su camino. Este es el que
 * impide que el crudo derivado de `literaryWorkNavigationTeasersWithAuthorsQuery` y el mapeo de
 * `fetchCatalog` diverjan en silencio. La expectativa sale del corpus de dominio, que es la vista
 * hermana sobre los mismos documentos, y no de repetir el mapeo crudo: por eso una omisión o un
 * cambio de campo falla acá.
 */
import type { SanityClient } from '@sanity/client';
import { fn } from '@test-utils';

import { SanityLiteraryWorkRepository } from '../api/modules/literary-work/literary-work.repository.sanity';
import { onoffLiteraryWorkNavigationTeasersWithAuthorsMock } from './onoff-literary-work-teasers.mock';
import { onoffRawLiteraryWorkNavigationTeasersWithAuthorsMock } from './onoff-raw-literary-works.mock';

// Ver el spec homónimo de la landing para el porqué de sustituir el builder de imágenes.
/* eslint-disable no-restricted-syntax -- vi.mock: el builder de imágenes de Sanity no tiene punto de inyección */
vi.mock('@sanity/image-url', async () => {
	const { stubImageUrlBuilderModule } = await import('@testing/sanity-image-url.stub');
	return stubImageUrlBuilderModule();
});
/* eslint-enable no-restricted-syntax */

function repoReturning(raw: unknown): SanityLiteraryWorkRepository {
	const client = { fetch: fn(() => Promise.resolve(raw)) } as unknown as SanityClient;
	return new SanityLiteraryWorkRepository(client);
}

describe('el listado sin filtros coincide con el mapeo del ACL', () => {
	it.each(onoffRawLiteraryWorkNavigationTeasersWithAuthorsMock.map(({ slug }) => slug))(
		'maps the raw navigation teaser of "%s" into its domain projection',
		async (slug) => {
			const raw = onoffRawLiteraryWorkNavigationTeasersWithAuthorsMock.find((entry) => entry.slug === slug);
			const expected = onoffLiteraryWorkNavigationTeasersWithAuthorsMock.find((teaser) => teaser.slug === slug);
			const { literaryWorks } = await repoReturning([raw]).fetchCatalog();
			const [mapped] = literaryWorks;

			expect(mapped).toBeDefined();
			expect(expected).toBeDefined();
			expect(mapped).toEqual(expected);
		},
	);
});
