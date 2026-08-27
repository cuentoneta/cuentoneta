import { onoffLiteraryWorkTeasersMock } from '@mocks/onoff-literary-work-teasers.mock';

import { assertValidJsonLd } from '@testing/json-ld-validation';
import { buildLiteraryWorkCatalogBreadcrumb, buildLiteraryWorkCatalogSchema } from './literary-works.schema';

const websiteUrl = 'https://www.cuentoneta.ar/';

describe('buildLiteraryWorkCatalogSchema', () => {
	it('should build a schema.org-valid CollectionPage', async () => {
		await expect(
			assertValidJsonLd(buildLiteraryWorkCatalogSchema(onoffLiteraryWorkTeasersMock, websiteUrl)),
		).resolves.toBeUndefined();
	});

	// El catálogo vive en `/literary-work` y cada obra en `/read/<slug>`: a diferencia de las colecciones,
	// el listado y el detalle no comparten prefijo de ruta.
	it('should build a CollectionPage whose items point at the reading route', () => {
		const schema = buildLiteraryWorkCatalogSchema(onoffLiteraryWorkTeasersMock, websiteUrl);

		expect(schema).toMatchObject({
			'@context': 'https://schema.org',
			'@type': 'CollectionPage',
			name: 'Obras',
			url: 'https://www.cuentoneta.ar/literary-work',
			inLanguage: 'es-AR',
			mainEntity: {
				'@type': 'ItemList',
				numberOfItems: onoffLiteraryWorkTeasersMock.length,
				itemListElement: onoffLiteraryWorkTeasersMock.map((literaryWork, index) => ({
					'@type': 'ListItem',
					position: index + 1,
					url: `https://www.cuentoneta.ar/read/${literaryWork.slug}`,
					name: literaryWork.title,
				})),
			},
		});
	});

	it('should not emit double slashes when the website URL ends in one', () => {
		const schema = buildLiteraryWorkCatalogSchema(onoffLiteraryWorkTeasersMock, websiteUrl);

		expect(schema.url).not.toContain('//literary-work');
	});
});

describe('buildLiteraryWorkCatalogBreadcrumb', () => {
	it('should build the trail Inicio to Obras', async () => {
		const breadcrumb = buildLiteraryWorkCatalogBreadcrumb(websiteUrl);

		await expect(assertValidJsonLd(breadcrumb)).resolves.toBeUndefined();
		expect(breadcrumb.itemListElement).toHaveLength(2);
		expect(breadcrumb.itemListElement).toMatchObject([
			{ position: 1, name: 'Inicio' },
			{ position: 2, name: 'Obras' },
		]);
	});
});
