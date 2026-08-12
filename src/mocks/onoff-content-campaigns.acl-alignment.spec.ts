import { mapContentCampaigns } from '../api/_utils/functions';
import { contentCampaignMock } from './content-campaign.mock';
import { onoffRawContentCampaignsMock } from './onoff-raw-landing-page.mock';

/* eslint-disable no-restricted-syntax -- vi.mock: el builder de imágenes de Sanity no tiene punto de inyección */
vi.mock('@sanity/image-url', async () => {
	const { stubImageUrlBuilderModule } = await import('@testing/sanity-image-url.stub');
	return stubImageUrlBuilderModule();
});
/* eslint-enable no-restricted-syntax */

// Cierra la cadena entera del corpus de campañas: el documento alimenta la query, la query genera el raw
// y el raw pasa por el ACL. Sin este cruce, el corpus de dominio —que es lo que consumen las stories y el
// carrusel— podría afirmar una forma que la API no devuelve.
describe('el corpus de dominio de ContentCampaign coincide con el mapeo del ACL', () => {
	it('maps the raw campaigns into their domain mock', () => {
		// `toStrictEqual` y no `toEqual`: acá no hay campos opcionales que una capa pase explícitamente en
		// `undefined` y la otra omita, así que comparar también las claves de más sale gratis.
		expect(mapContentCampaigns(onoffRawContentCampaignsMock)).toStrictEqual(contentCampaignMock);
	});
});
