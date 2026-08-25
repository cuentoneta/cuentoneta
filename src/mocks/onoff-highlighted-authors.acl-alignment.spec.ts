import { mapHighlightedAuthors } from '../api/_utils/functions';
import { onoffHighlightedAuthorsMock } from './onoff-highlighted-authors.mock';
import { onoffRawHighlightedAuthorsMock } from './onoff-raw-landing-page.mock';

/* eslint-disable no-restricted-syntax -- vi.mock: el builder de imágenes de Sanity no tiene punto de inyección */
vi.mock('@sanity/image-url', async () => {
	const { stubImageUrlBuilderModule } = await import('@testing/sanity-image-url.stub');
	return stubImageUrlBuilderModule();
});
/* eslint-enable no-restricted-syntax */

// Cierra la cadena entera del corpus de destacados: el documento alimenta la query, la query genera el raw
// y el raw pasa por el ACL. Sin este cruce, el corpus de dominio —que es lo que consumen la story y el
// spec del componente— podría afirmar una forma que la API no devuelve.
describe('el corpus de dominio de HighlightedAuthor coincide con el mapeo del ACL', () => {
	it('maps the raw highlighted authors into their domain mock', () => {
		expect(mapHighlightedAuthors(onoffRawHighlightedAuthorsMock)).toStrictEqual(onoffHighlightedAuthorsMock);
	});
});
