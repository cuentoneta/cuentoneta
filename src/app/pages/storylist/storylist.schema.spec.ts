import { storylistMock } from '@mocks/storylist.mock';

import { assertValidJsonLd } from '../../../../e2e/_utils/json-ld-validation';
import { buildStorylistBreadcrumb, buildStorylistCollectionSchema } from './storylist.schema';

const websiteUrl = 'https://www.cuentoneta.ar/';

describe('storylist schema builders', () => {
	it('buildStorylistCollectionSchema emite un CollectionPage schema.org válido', async () => {
		await expect(assertValidJsonLd(buildStorylistCollectionSchema(storylistMock, websiteUrl))).resolves.toBeUndefined();
	});

	it('el CollectionPage lista los cuentos en un ItemList ordenado', () => {
		expect(buildStorylistCollectionSchema(storylistMock, websiteUrl)).toMatchObject({
			'@type': 'CollectionPage',
			mainEntity: { '@type': 'ItemList', numberOfItems: storylistMock.stories.length },
		});
	});

	it('buildStorylistBreadcrumb emite un BreadcrumbList schema.org válido', async () => {
		await expect(assertValidJsonLd(buildStorylistBreadcrumb(storylistMock, websiteUrl))).resolves.toBeUndefined();
	});
});
