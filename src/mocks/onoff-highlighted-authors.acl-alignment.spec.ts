import { stubSanityClient } from '@testing/sanity-client.stub';
import { SanityContentRepository } from '../api/modules/content/content.repository.sanity';
import { rotatingContentQuery } from '../api/_queries/content.query';
import { onoffHighlightedAuthorsMock } from './onoff-highlighted-authors.mock';
import { onoffRawLandingPageMock } from './onoff-raw-landing-page.mock';

/* eslint-disable no-restricted-syntax -- vi.mock: el builder de imágenes de Sanity no tiene punto de inyección */
vi.mock('@sanity/image-url', async () => {
	const { stubImageUrlBuilderModule } = await import('@testing/sanity-image-url.stub');
	return stubImageUrlBuilderModule();
});
/* eslint-enable no-restricted-syntax */

// El mapeo de los destacados es privado del repository, así que el cruce entra por su superficie
// pública: es la misma cadena, ejercitada por donde la recorre el consumidor real.
function repository(): SanityContentRepository {
	// El contenido rotativo no participa de este cruce, pero la lectura lo pide igual, así que se
	// responde vacío en vez de dejarlo sin respuesta.
	const { client } = stubSanityClient(
		[[rotatingContentQuery, { _id: 'rotatingContent', name: 'Lo más leído', mostRead: [] }]],
		onoffRawLandingPageMock,
	);
	return new SanityContentRepository(client);
}

// Cierra la cadena entera del corpus de destacados: el documento alimenta la query, la query genera el raw
// y el raw pasa por el ACL. Sin este cruce, el corpus de dominio —que es lo que consumen la story y el
// spec del componente— podría afirmar una forma que la API no devuelve.
describe('el corpus de dominio de HighlightedAuthor coincide con el mapeo del ACL', () => {
	it('maps the raw highlighted authors into their domain mock', async () => {
		const landingPage = await repository().fetchLandingPageContent(onoffRawLandingPageMock.slug);

		expect(landingPage?.highlightedAuthors).toStrictEqual(onoffHighlightedAuthorsMock);
	});
});
