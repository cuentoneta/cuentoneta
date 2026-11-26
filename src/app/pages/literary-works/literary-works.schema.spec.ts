import { onoffLiteraryWorkCatalogEntriesMock } from '@mocks/onoff-literary-work-catalog-entries.mock';

import { assertValidJsonLd } from '@testing/json-ld-validation';
import { buildLiteraryWorkCatalogBreadcrumb, buildLiteraryWorkCatalogSchema } from './literary-works.schema';

const websiteUrl = 'https://www.cuentoneta.ar/';

describe('buildLiteraryWorkCatalogSchema', () => {
	it('should build a schema.org-valid CollectionPage', async () => {
		await expect(
			assertValidJsonLd(buildLiteraryWorkCatalogSchema(onoffLiteraryWorkCatalogEntriesMock, websiteUrl)),
		).resolves.toBeUndefined();
	});

	// El catálogo vive en `/literary-work` y cada obra en `/literary-work/<slug>`: a diferencia de las colecciones,
	// el listado y el detalle no comparten prefijo de ruta.
	it('should build a CollectionPage whose items point at the reading route', () => {
		const schema = buildLiteraryWorkCatalogSchema(onoffLiteraryWorkCatalogEntriesMock, websiteUrl);

		expect(schema).toMatchObject({
			'@context': 'https://schema.org',
			'@type': 'CollectionPage',
			name: 'Obras',
			url: 'https://www.cuentoneta.ar/literary-work',
			inLanguage: 'es-AR',
			mainEntity: {
				'@type': 'ItemList',
				numberOfItems: onoffLiteraryWorkCatalogEntriesMock.length,
				itemListElement: onoffLiteraryWorkCatalogEntriesMock.map((literaryWork, index) => ({
					'@type': 'ListItem',
					position: index + 1,
					url: `https://www.cuentoneta.ar/literary-work/${literaryWork.slug}`,
					name: literaryWork.title,
				})),
			},
		});
	});

	// El orden del `ItemList` es el que sirve el catálogo: el builder no reordena lo que recibe.
	it('should list the items in the order it receives them', () => {
		const reversed = [...onoffLiteraryWorkCatalogEntriesMock].reverse();

		const schema = buildLiteraryWorkCatalogSchema(reversed, websiteUrl);

		expect(schema).toMatchObject({
			mainEntity: {
				itemListElement: reversed.map(({ slug }) => ({ url: `https://www.cuentoneta.ar/literary-work/${slug}` })),
			},
		});
	});

	// La base llega con y sin barra final según el entorno; las dos tienen que producir la misma URL.
	it('should normalize the website URL whether or not it ends in a slash', () => {
		const withSlash = buildLiteraryWorkCatalogSchema(onoffLiteraryWorkCatalogEntriesMock, websiteUrl);
		const withoutSlash = buildLiteraryWorkCatalogSchema(
			onoffLiteraryWorkCatalogEntriesMock,
			'https://www.cuentoneta.ar',
		);

		expect(withSlash.url).toBe(withoutSlash.url);
		expect(withSlash.url).toBe('https://www.cuentoneta.ar/literary-work');
	});
});

describe('buildLiteraryWorkCatalogBreadcrumb', () => {
	it('should build the trail from the home to the catalogue', () => {
		const breadcrumb = buildLiteraryWorkCatalogBreadcrumb(websiteUrl);

		expect(breadcrumb['itemListElement']).toEqual([
			{ '@type': 'ListItem', position: 1, name: 'Inicio', item: { '@id': 'https://www.cuentoneta.ar/' } },
			{
				'@type': 'ListItem',
				position: 2,
				name: 'Obras',
				item: { '@id': 'https://www.cuentoneta.ar/literary-work' },
			},
		]);
	});

	it('should build a schema.org-valid BreadcrumbList', async () => {
		await expect(assertValidJsonLd(buildLiteraryWorkCatalogBreadcrumb(websiteUrl))).resolves.toBeUndefined();
	});
});
