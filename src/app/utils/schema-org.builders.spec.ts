import { authorMock } from '@mocks/author.mock';

import { assertValidJsonLd } from '@seo-invariants/json-ld-validation';
import { buildBreadcrumbSchema, buildPersonSchema } from './schema-org.builders';

describe('buildPersonSchema', () => {
	it('should build a Person with name, profile url, image and sameAs', () => {
		expect(buildPersonSchema(authorMock, 'https://www.cuentoneta.ar/author/francois-onoff')).toEqual({
			'@type': 'Person',
			name: 'François Onoff',
			url: 'https://www.cuentoneta.ar/author/francois-onoff',
			image: 'assets/img/mocks/author/francois-onoff.png',
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
				{ '@type': 'ListItem', position: 1, name: 'Inicio', item: { '@id': 'https://x/home' } },
				{ '@type': 'ListItem', position: 2, name: 'Autores', item: { '@id': 'https://x/authors' } },
			],
		});
	});

	it('should build a schema.org-valid BreadcrumbList', async () => {
		const schema = buildBreadcrumbSchema([
			{ name: 'Inicio', url: 'https://x/home' },
			{ name: 'Autores', url: 'https://x/authors' },
		]);

		await expect(assertValidJsonLd(schema)).resolves.toBeUndefined();
	});
});
