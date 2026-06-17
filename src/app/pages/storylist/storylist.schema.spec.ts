import { storylistMock } from '@mocks/storylist.mock';

import { buildStorylistBreadcrumb, buildStorylistCollectionSchema } from './storylist.schema';

describe('buildStorylistCollectionSchema', () => {
	const websiteUrl = 'https://www.cuentoneta.ar/';

	it('should build a CollectionPage with an ordered ItemList of its stories', () => {
		const schema = buildStorylistCollectionSchema(storylistMock, websiteUrl);

		expect(schema).toMatchObject({
			'@context': 'https://schema.org',
			'@type': 'CollectionPage',
			name: 'La Cuentoneta 1.0',
			url: 'https://www.cuentoneta.ar/storylist/verano-2022',
			inLanguage: 'es-AR',
			mainEntity: {
				'@type': 'ItemList',
				numberOfItems: 1,
				itemListElement: [
					{
						'@type': 'ListItem',
						position: 1,
						url: 'https://www.cuentoneta.ar/story/el-espejo-del-tiempo',
						name: 'El espejo del tiempo',
					},
				],
			},
		});
	});
});

describe('buildStorylistBreadcrumb', () => {
	it('should build the trail Inicio → storylist', () => {
		const schema = buildStorylistBreadcrumb(storylistMock, 'https://www.cuentoneta.ar/');

		expect(schema['itemListElement']).toEqual([
			{ '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.cuentoneta.ar/home' },
			{
				'@type': 'ListItem',
				position: 2,
				name: 'La Cuentoneta 1.0',
				item: 'https://www.cuentoneta.ar/storylist/verano-2022',
			},
		]);
	});
});
