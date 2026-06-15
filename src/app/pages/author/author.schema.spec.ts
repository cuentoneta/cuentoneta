import { authorMock } from '@mocks/author.mock';

import { buildAuthorBreadcrumb, buildAuthorPersonSchema } from './author.schema';

describe('buildAuthorPersonSchema', () => {
	const websiteUrl = 'https://www.cuentoneta.ar/';

	it('should build a Person with @context, profile, image, sameAs and life dates', () => {
		expect(buildAuthorPersonSchema(authorMock, websiteUrl)).toEqual({
			'@context': 'https://schema.org',
			'@type': 'Person',
			name: 'François Onoff',
			url: 'https://www.cuentoneta.ar/author/francois-onoff',
			image: 'https://cdn.sanity.io/images/s4dbqkc5/production/f656d95d41369adb6f7d3a7d0b20b36861fd2028-350x350.jpg',
			sameAs: ['https://es.wikipedia.org/wiki/Francois_Onoff'],
			birthDate: '1948-01-01',
			deathDate: '1994-12-31',
		});
	});

	it('should omit life dates when the author has none', () => {
		const author = { ...authorMock, bornOn: undefined, diedOn: undefined };

		const schema = buildAuthorPersonSchema(author, websiteUrl);

		expect(schema['birthDate']).toBeUndefined();
		expect(schema['deathDate']).toBeUndefined();
	});
});

describe('buildAuthorBreadcrumb', () => {
	it('should build the trail Inicio → Autores → author', () => {
		const schema = buildAuthorBreadcrumb(authorMock, 'https://www.cuentoneta.ar/');

		expect(schema['itemListElement']).toEqual([
			{ '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.cuentoneta.ar/home' },
			{ '@type': 'ListItem', position: 2, name: 'Autores', item: 'https://www.cuentoneta.ar/authors' },
			{
				'@type': 'ListItem',
				position: 3,
				name: 'François Onoff',
				item: 'https://www.cuentoneta.ar/author/francois-onoff',
			},
		]);
	});
});
