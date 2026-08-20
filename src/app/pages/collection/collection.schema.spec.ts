import { geometriasDelDesveloCollectionMock } from '@mocks/onoff-collections.mock';

import { assertValidJsonLd } from '@testing/json-ld-validation';
import { buildCollectionBreadcrumb, buildCollectionPageSchema } from './collection.schema';

const websiteUrl = 'https://www.cuentoneta.ar/';

describe('buildCollectionPageSchema', () => {
	it('should build a schema.org-valid CollectionPage', async () => {
		await expect(
			assertValidJsonLd(buildCollectionPageSchema(geometriasDelDesveloCollectionMock, websiteUrl)),
		).resolves.toBeUndefined();
	});

	it('should build a CollectionPage with an ordered ItemList of its literary works', () => {
		const schema = buildCollectionPageSchema(geometriasDelDesveloCollectionMock, websiteUrl);

		expect(schema).toMatchObject({
			'@context': 'https://schema.org',
			'@type': 'CollectionPage',
			name: 'Geometrías del desvelo',
			url: 'https://www.cuentoneta.ar/collection/geometrias-del-desvelo',
			inLanguage: 'es-AR',
			mainEntity: {
				'@type': 'ItemList',
				numberOfItems: geometriasDelDesveloCollectionMock.count,
				itemListElement: geometriasDelDesveloCollectionMock.literaryWorks.map((literaryWork, index) => ({
					'@type': 'ListItem',
					position: index + 1,
					url: `https://www.cuentoneta.ar/read/${literaryWork.slug}`,
					name: literaryWork.title,
				})),
			},
		});
	});
});

describe('buildCollectionBreadcrumb', () => {
	it('should build the trail Inicio → collection', () => {
		const schema = buildCollectionBreadcrumb(geometriasDelDesveloCollectionMock, websiteUrl);

		expect(schema['itemListElement']).toEqual([
			{ '@type': 'ListItem', position: 1, name: 'Inicio', item: { '@id': 'https://www.cuentoneta.ar/home' } },
			{
				'@type': 'ListItem',
				position: 2,
				name: 'Geometrías del desvelo',
				item: { '@id': 'https://www.cuentoneta.ar/collection/geometrias-del-desvelo' },
			},
		]);
	});

	it('should build a schema.org-valid BreadcrumbList', async () => {
		await expect(
			assertValidJsonLd(buildCollectionBreadcrumb(geometriasDelDesveloCollectionMock, websiteUrl)),
		).resolves.toBeUndefined();
	});
});
