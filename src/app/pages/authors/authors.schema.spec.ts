import { onoffHighlightedAuthorsOfLength } from '@mocks/onoff-highlighted-authors.mock';

import { assertValidJsonLd } from '@testing/json-ld-validation';
import { buildAuthorCatalogBreadcrumb, buildAuthorCatalogSchema } from './authors.schema';

const websiteUrl = 'https://www.cuentoneta.ar/';
const authors = onoffHighlightedAuthorsOfLength(3).map(({ author }) => author);

describe('buildAuthorCatalogSchema', () => {
	it('should build a schema.org-valid CollectionPage', async () => {
		await expect(assertValidJsonLd(buildAuthorCatalogSchema(authors, websiteUrl))).resolves.toBeUndefined();
	});

	it('should build a CollectionPage with an ItemList of the author profiles', () => {
		const schema = buildAuthorCatalogSchema(authors, websiteUrl);

		expect(schema).toMatchObject({
			'@context': 'https://schema.org',
			'@type': 'CollectionPage',
			name: 'Autores',
			url: 'https://www.cuentoneta.ar/authors',
			inLanguage: 'es-AR',
			mainEntity: {
				'@type': 'ItemList',
				numberOfItems: authors.length,
				itemListElement: authors.map((author, index) => ({
					'@type': 'ListItem',
					position: index + 1,
					url: `https://www.cuentoneta.ar/author/${author.slug}`,
					name: author.name,
				})),
			},
		});
	});

	it('should keep the order of the authors it receives', () => {
		const reversed = [...authors].reverse();

		const schema = buildAuthorCatalogSchema(reversed, websiteUrl);

		expect(schema.mainEntity).toMatchObject({
			itemListElement: reversed.map((author) => ({ url: `https://www.cuentoneta.ar/author/${author.slug}` })),
		});
	});

	it('should trim the whitespace around an author name', () => {
		const [author] = authors;

		const schema = buildAuthorCatalogSchema([{ ...author, name: ` ${author.name} ` }], websiteUrl);

		expect(schema.mainEntity).toMatchObject({ itemListElement: [{ name: author.name }] });
	});

	it('should not emit double slashes when the website URL ends in one', () => {
		const schema = buildAuthorCatalogSchema(authors, websiteUrl);

		expect(schema.url).not.toContain('//authors');
	});
});

describe('buildAuthorCatalogBreadcrumb', () => {
	it('should build the trail Inicio → Autores', () => {
		const schema = buildAuthorCatalogBreadcrumb(websiteUrl);

		expect(schema['itemListElement']).toEqual([
			{ '@type': 'ListItem', position: 1, name: 'Inicio', item: { '@id': 'https://www.cuentoneta.ar/home' } },
			{ '@type': 'ListItem', position: 2, name: 'Autores', item: { '@id': 'https://www.cuentoneta.ar/authors' } },
		]);
	});

	it('should build a schema.org-valid BreadcrumbList', async () => {
		await expect(assertValidJsonLd(buildAuthorCatalogBreadcrumb(websiteUrl))).resolves.toBeUndefined();
	});
});
