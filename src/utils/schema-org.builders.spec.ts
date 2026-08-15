import { authorMock } from '@mocks/author.mock';

import { assertValidJsonLd } from '@testing/json-ld-validation';
import { withoutUrl } from '@testing/resource-without-url';
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

	it('should skip a resource without url instead of throwing', () => {
		const [resource] = authorMock.resources;
		const author = { ...authorMock, resources: [resource, withoutUrl(resource)] };

		const schema = buildPersonSchema(author, 'https://x/author/a');

		expect(schema.sameAs).toEqual([resource.url]);
	});

	it('should omit sameAs when the only resource has no url', () => {
		const author = { ...authorMock, resources: [withoutUrl(authorMock.resources[0])] };

		expect(buildPersonSchema(author, 'https://x/author/a')).not.toHaveProperty('sameAs');
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
