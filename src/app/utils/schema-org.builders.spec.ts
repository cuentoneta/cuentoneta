import { authorMock } from '@mocks/author.mock';

import { buildBreadcrumbSchema, buildPersonSchema } from './schema-org.builders';

describe('buildPersonSchema', () => {
	it('should build a Person with name, profile url, image and sameAs', () => {
		expect(buildPersonSchema(authorMock, 'https://www.cuentoneta.ar/author/francois-onoff')).toEqual({
			'@type': 'Person',
			name: 'François Onoff',
			url: 'https://www.cuentoneta.ar/author/francois-onoff',
			image: 'https://cdn.sanity.io/images/s4dbqkc5/production/f656d95d41369adb6f7d3a7d0b20b36861fd2028-350x350.jpg',
			sameAs: ['https://es.wikipedia.org/wiki/Francois_Onoff'],
		});
	});

	it('should omit image and sameAs when the author has none', () => {
		const author = { ...authorMock, imageUrl: '', resources: [] };

		expect(buildPersonSchema(author, 'https://x/author/a')).toEqual({
			'@type': 'Person',
			name: 'François Onoff',
			url: 'https://x/author/a',
		});
	});
});

describe('buildBreadcrumbSchema', () => {
	it('should build a BreadcrumbList with positioned ListItems', () => {
		const schema = buildBreadcrumbSchema([
			{ name: 'Inicio', url: 'https://x/home' },
			{ name: 'Autores', url: 'https://x/authors' },
		]);

		expect(schema).toEqual({
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{ '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://x/home' },
				{ '@type': 'ListItem', position: 2, name: 'Autores', item: 'https://x/authors' },
			],
		});
	});
});
