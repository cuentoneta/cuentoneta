/**
 * El cruce del corpus de la página de inicio contra su ACL. El porqué general —qué protege que las dos
 * capas coincidan— está en el spec homónimo de `LiteraryWork`; acá interesa qué agrega este.
 *
 * La landing es la única pantalla que ensambla piezas de **dos documentos** y de **tres entidades**:
 * colecciones, obras destacadas y campañas, más el contenido rotativo, que vive aparte. Cierra la cadena
 * documento → query → raw → dominio para toda la página, que hasta ahora solo estaba cerrada para las
 * campañas.
 *
 * Los teasers de colección y las vistas de navegación de obra que el repository produce acá salen de
 * proyecciones propias de la landing, distintas de las del catálogo y del listado de obras: una entidad
 * puede mapear bien por su camino y estar mal por éste, y los cruces de `Collection` y `LiteraryWork` no
 * lo verían.
 */
import type { SanityClient } from '@sanity/client';
import { fn } from '@test-utils';
import { SanityContentRepository } from '../api/modules/content/content.repository.sanity';
import { rotatingContentQuery } from '../api/_queries/content.query';
import { onoffCollectionTeasersMock } from './onoff-collections.mock';
import { onoffLiteraryWorkNavigationTeasersWithAuthorsMock } from './onoff-literary-work-teasers.mock';
import { onoffRawLandingPageMock, onoffRawRotatingContentMock } from './onoff-raw-landing-page.mock';

// Ver el spec homónimo de `LiteraryWork` para el porqué de sustituir el builder de imágenes.
/* eslint-disable no-restricted-syntax -- vi.mock: el builder de imágenes de Sanity no tiene punto de inyección */
vi.mock('@sanity/image-url', async () => {
	const { stubImageUrlBuilderModule } = await import('@testing/sanity-image-url.stub');
	return stubImageUrlBuilderModule();
});
/* eslint-enable no-restricted-syntax */

function repository(): SanityContentRepository {
	const fetch = fn((query: unknown) =>
		Promise.resolve(query === rotatingContentQuery ? onoffRawRotatingContentMock : onoffRawLandingPageMock),
	);
	return new SanityContentRepository({ fetch } as unknown as SanityClient);
}

// El corpus de dominio declara el elenco entero; la landing destaca un subconjunto, elegido por su
// documento. Se compara contra lo que el documento referencia y no contra el elenco completo.
function expectedBySlug<T extends { slug: string }>(corpus: readonly T[], slugs: readonly string[]): T[] {
	return slugs.map((slug) => {
		const found = corpus.find((entry) => entry.slug === slug);
		if (!found) {
			throw new Error(`El corpus de dominio no declara "${slug}", que la landing del canon referencia.`);
		}
		return found;
	});
}

describe('el corpus de dominio de la página de inicio coincide con el mapeo del ACL', () => {
	it('maps the raw collections into their domain teasers', async () => {
		const slugs = onoffRawLandingPageMock.collections.map(({ slug }) => slug);

		const landingPage = await repository().fetchLandingPageContent(onoffRawLandingPageMock.slug);

		expect(slugs.length).toBeGreaterThan(0);
		expect(landingPage?.collections).toEqual(expectedBySlug(onoffCollectionTeasersMock, slugs));
	});

	it('maps the raw latest works into their domain navigation teasers', async () => {
		const slugs = onoffRawLandingPageMock.latestLiteraryWorks.map(({ slug }) => slug);

		const landingPage = await repository().fetchLandingPageContent(onoffRawLandingPageMock.slug);

		expect(slugs.length).toBeGreaterThan(0);
		expect(landingPage?.latestReads).toEqual(expectedBySlug(onoffLiteraryWorkNavigationTeasersWithAuthorsMock, slugs));
	});

	it('maps the raw most read works into their domain navigation teasers', async () => {
		const slugs = onoffRawRotatingContentMock.mostReadLiteraryWorks.map(({ slug }) => slug);

		const rotatingContent = await repository().fetchRotatingContent();

		expect(slugs.length).toBeGreaterThan(0);
		expect(rotatingContent?.mostRead).toEqual(expectedBySlug(onoffLiteraryWorkNavigationTeasersWithAuthorsMock, slugs));
	});
});
