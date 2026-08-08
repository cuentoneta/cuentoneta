import { mapContentCampaigns } from '../api/_utils/functions';
import { contentCampaignMock } from './content-campaign.mock';
import { onoffRawContentCampaignsMock } from './onoff-raw-content-campaigns.mock';

// Ver los specs homónimos de `LiteraryWork` y `Collection` para el porqué de sustituir el builder de
// imágenes. Acá el mapeo pasa por `urlForWithAutoFormat`, así que el doble tiene que encadenar `auto()`.
/* eslint-disable no-restricted-syntax -- vi.mock: el builder de imágenes de Sanity no tiene punto de inyección */
vi.mock('@sanity/image-url', async () => {
	const { localImagePathForImageSource } = await import('./onoff-image-assets.mock');
	return {
		createImageUrlBuilder: () => ({
			image: (source: unknown) => {
				const built = { url: () => localImagePathForImageSource(source), auto: () => built };
				return built;
			},
		}),
	};
});
/* eslint-enable no-restricted-syntax */

// Cierra la cadena entera del corpus de campañas: el documento alimenta la query, la query genera el raw
// y el raw pasa por el ACL. Sin este cruce, el corpus de dominio —que es lo que consumen las stories y el
// carrusel— podría afirmar una forma que la API no devuelve.
describe('el corpus de dominio de ContentCampaign coincide con el mapeo del ACL', () => {
	it('maps the raw campaigns into their domain mock', () => {
		expect(mapContentCampaigns(onoffRawContentCampaignsMock)).toEqual(contentCampaignMock);
	});
});
