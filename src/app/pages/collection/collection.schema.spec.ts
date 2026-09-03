import { onoffCollectionsMock } from '@mocks/onoff-collections.mock';

import { assertValidJsonLd } from '@testing/json-ld-validation';
import { buildCollectionBreadcrumb, buildCollectionPageSchema } from './collection.schema';

const websiteUrl = 'https://www.cuentoneta.ar/';
const [canon] = onoffCollectionsMock;

describe('buildCollectionPageSchema', () => {
	it('should build a schema.org-valid CollectionPage', async () => {
		await expect(assertValidJsonLd(buildCollectionPageSchema(canon, websiteUrl))).resolves.toBeUndefined();
	});

	it('should build a CollectionPage with an ordered ItemList of its literary works', () => {
		const schema = buildCollectionPageSchema(canon, websiteUrl);

		expect(schema).toMatchObject({
			'@context': 'https://schema.org',
			'@type': 'CollectionPage',
			name: canon.title,
			url: `https://www.cuentoneta.ar/collection/${canon.slug}`,
			inLanguage: 'es-AR',
			mainEntity: {
				'@type': 'ItemList',
				numberOfItems: canon.count,
				itemListElement: canon.literaryWorks.map((literaryWork, index) => ({
					'@type': 'ListItem',
					position: index + 1,
					url: `https://www.cuentoneta.ar/literary-work/${literaryWork.slug}`,
					name: literaryWork.title,
				})),
			},
		});
	});
});

describe('buildCollectionBreadcrumb', () => {
	it('should build the trail Inicio → collection', () => {
		const schema = buildCollectionBreadcrumb(canon, websiteUrl);

		expect(schema['itemListElement']).toEqual([
			{ '@type': 'ListItem', position: 1, name: 'Inicio', item: { '@id': 'https://www.cuentoneta.ar/home' } },
			{
				'@type': 'ListItem',
				position: 2,
				name: canon.title,
				item: { '@id': `https://www.cuentoneta.ar/collection/${canon.slug}` },
			},
		]);
	});

	it('should build a schema.org-valid BreadcrumbList', async () => {
		await expect(assertValidJsonLd(buildCollectionBreadcrumb(canon, websiteUrl))).resolves.toBeUndefined();
	});
});
