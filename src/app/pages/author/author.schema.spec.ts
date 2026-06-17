import { authorMock } from '@mocks/author.mock';

import { buildAuthorBreadcrumb, buildAuthorProfilePageSchema } from './author.schema';

describe('buildAuthorProfilePageSchema', () => {
	const websiteUrl = 'https://www.cuentoneta.ar/';

	it('should build a ProfilePage with creation/update dates wrapping the Person as mainEntity', () => {
		expect(buildAuthorProfilePageSchema(authorMock, websiteUrl)).toEqual({
			'@context': 'https://schema.org',
			'@type': 'ProfilePage',
			dateCreated: '2021-12-28T00:00:00Z',
			dateModified: '2024-05-20T10:30:00Z',
			mainEntity: {
				'@type': 'Person',
				name: 'François Onoff',
				url: 'https://www.cuentoneta.ar/author/francois-onoff',
				image: 'https://cdn.sanity.io/images/s4dbqkc5/production/f656d95d41369adb6f7d3a7d0b20b36861fd2028-350x350.jpg',
				sameAs: ['https://es.wikipedia.org/wiki/Francois_Onoff'],
				birthDate: '1948-01-01',
				deathDate: '1994-12-31',
			},
		});
	});

	it('should forward the ISO datetime dates verbatim to dateCreated/dateModified', () => {
		const author = { ...authorMock, createdAt: '2022-01-25T23:26:34Z', updatedAt: '2026-06-09T00:32:32Z' };

		const schema = buildAuthorProfilePageSchema(author, websiteUrl);

		expect(schema).toMatchObject({
			dateCreated: '2022-01-25T23:26:34Z',
			dateModified: '2026-06-09T00:32:32Z',
		});
	});

	it('should omit life dates in mainEntity when the author has none', () => {
		const author = { ...authorMock, bornOn: undefined, diedOn: undefined };

		const mainEntity = buildAuthorProfilePageSchema(author, websiteUrl)['mainEntity'] as Record<string, unknown>;

		expect(mainEntity['birthDate']).toBeUndefined();
		expect(mainEntity['deathDate']).toBeUndefined();
	});

	it('should omit image and sameAs in mainEntity when the author has none', () => {
		const author = { ...authorMock, imageUrl: '', resources: [] };

		const mainEntity = buildAuthorProfilePageSchema(author, websiteUrl)['mainEntity'] as Record<string, unknown>;

		expect(mainEntity['image']).toBeUndefined();
		expect(mainEntity['sameAs']).toBeUndefined();
	});

	it('should normalize a trailing slash in the website URL', () => {
		const mainEntity = buildAuthorProfilePageSchema(authorMock, 'https://www.cuentoneta.ar/')['mainEntity'] as Record<
			string,
			unknown
		>;

		expect(mainEntity['url']).toBe('https://www.cuentoneta.ar/author/francois-onoff');
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
