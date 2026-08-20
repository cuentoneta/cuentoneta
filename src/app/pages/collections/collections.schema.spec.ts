import { onoffCollectionTeasersMock } from '@mocks/onoff-collections.mock';

import { assertValidJsonLd } from '@testing/json-ld-validation';
import { buildCollectionCatalogBreadcrumb, buildCollectionCatalogSchema } from './collections.schema';

const websiteUrl = 'https://www.cuentoneta.ar/';

describe('buildCollectionCatalogSchema', () => {
	it('should build a schema.org-valid CollectionPage', async () => {
		await expect(
			assertValidJsonLd(buildCollectionCatalogSchema(onoffCollectionTeasersMock, websiteUrl)),
		).resolves.toBeUndefined();
	});

	it('should build a CollectionPage with an ordered ItemList of the catalogue', () => {
		const schema = buildCollectionCatalogSchema(onoffCollectionTeasersMock, websiteUrl);

		expect(schema).toMatchObject({
			'@context': 'https://schema.org',
			'@type': 'CollectionPage',
			name: 'Colecciones',
			url: 'https://www.cuentoneta.ar/collection',
			inLanguage: 'es-AR',
			mainEntity: {
				'@type': 'ItemList',
				numberOfItems: onoffCollectionTeasersMock.length,
				itemListElement: onoffCollectionTeasersMock.map((collection, index) => ({
					'@type': 'ListItem',
					position: index + 1,
					url: `https://www.cuentoneta.ar/collection/${collection.slug}`,
					name: collection.title,
				})),
			},
		});
	});

	// La URL del sitio llega con barra final; sin recortarla el bloque publicaría URLs con barra doble.
	it('should not emit double slashes when the website URL ends in one', () => {
		const schema = buildCollectionCatalogSchema(onoffCollectionTeasersMock, websiteUrl);

		expect(schema.url).not.toContain('//collection');
	});
});

describe('buildCollectionCatalogBreadcrumb', () => {
	it('should build the trail Inicio → Colecciones', () => {
		const schema = buildCollectionCatalogBreadcrumb(websiteUrl);

		expect(schema['itemListElement']).toEqual([
			{ '@type': 'ListItem', position: 1, name: 'Inicio', item: { '@id': 'https://www.cuentoneta.ar/home' } },
			{
				'@type': 'ListItem',
				position: 2,
				name: 'Colecciones',
				item: { '@id': 'https://www.cuentoneta.ar/collection' },
			},
		]);
	});

	it('should build a schema.org-valid BreadcrumbList', async () => {
		await expect(assertValidJsonLd(buildCollectionCatalogBreadcrumb(websiteUrl))).resolves.toBeUndefined();
	});
});
