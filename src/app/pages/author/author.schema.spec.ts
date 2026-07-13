import { authorMock } from '@mocks/author.mock';
import type { TextBlockContent } from '@models/block-content.model';
import type { IsoDateTime } from '@utils/date.utils';

import { buildAuthorBreadcrumb, buildAuthorProfilePageSchema } from './author.schema';

function bioBlock(...texts: string[]): TextBlockContent {
	return {
		_type: 'block',
		_key: `block-${texts.length}`,
		style: 'normal',
		markDefs: [],
		children: texts.map((text, index) => ({ _type: 'span', _key: `span-${index}`, text, marks: [] })),
	};
}

describe('buildAuthorProfilePageSchema', () => {
	const websiteUrl = 'https://www.cuentoneta.ar/';

	it('should build a ProfilePage with creation/update dates wrapping the Person as mainEntity', () => {
		expect(buildAuthorProfilePageSchema(authorMock, websiteUrl)).toEqual({
			'@context': 'https://schema.org',
			'@type': 'ProfilePage',
			url: 'https://www.cuentoneta.ar/author/francois-onoff',
			dateCreated: '2021-12-28T00:00:00Z',
			dateModified: '2024-05-20T10:30:00Z',
			mainEntity: {
				'@type': 'Person',
				name: 'François Onoff',
				url: 'https://www.cuentoneta.ar/author/francois-onoff',
				image: 'assets/img/mocks/author/francois-onoff.png',
				sameAs: ['https://es.wikipedia.org/wiki/Francois_Onoff'],
				description: expect.any(String),
				birthDate: '1948-01-01',
				deathDate: '1994-12-31',
			},
		});
	});

	it('should flatten the biography PortableText into the Person description', () => {
		const author = {
			...authorMock,
			biography: [
				{
					...authorMock.biography[0],
					children: [{ ...authorMock.biography[0].children[0], text: 'Primera oración.' }],
				},
				{
					...authorMock.biography[1],
					children: [{ ...authorMock.biography[1].children[0], text: 'Segunda oración.' }],
				},
			],
		};

		const mainEntity = buildAuthorProfilePageSchema(author, websiteUrl)['mainEntity'] as Record<string, unknown>;

		expect(mainEntity['description'], 'une el texto de cada bloque separándolos con un espacio').toBe(
			'Primera oración. Segunda oración.',
		);
	});

	it('should truncate a long biography description at a word boundary with an ellipsis', () => {
		const fitsBeforeLimit = 'a'.repeat(295);
		const author = { ...authorMock, biography: [bioBlock(`${fitsBeforeLimit} palabraDescartada`)] };

		const mainEntity = buildAuthorProfilePageSchema(author, websiteUrl)['mainEntity'] as Record<string, unknown>;

		expect(mainEntity['description'], 'corta en el espacio previo al tope de 300 y descarta la palabra parcial').toBe(
			`${fitsBeforeLimit}…`,
		);
	});

	it('should hard-cut at the max length when there is no space within the limit', () => {
		const singleLongWord = 'b'.repeat(350);
		const author = { ...authorMock, biography: [bioBlock(singleLongWord)] };

		const mainEntity = buildAuthorProfilePageSchema(author, websiteUrl)['mainEntity'] as Record<string, unknown>;

		expect(mainEntity['description'], 'sin límite de palabra, cae al tope duro de 300 caracteres + elipsis').toBe(
			`${'b'.repeat(300)}…`,
		);
	});

	it('should collapse a block with empty children when flattening the biography', () => {
		const author = { ...authorMock, biography: [bioBlock(), bioBlock('Biografía sin bloque vacío previo.')] };

		const mainEntity = buildAuthorProfilePageSchema(author, websiteUrl)['mainEntity'] as Record<string, unknown>;

		expect(mainEntity['description'], 'el bloque vacío no agrega espacios ni artefactos al aplanar').toBe(
			'Biografía sin bloque vacío previo.',
		);
	});

	it('should omit the description in mainEntity when the author has no biography', () => {
		const author = { ...authorMock, biography: [] };

		const mainEntity = buildAuthorProfilePageSchema(author, websiteUrl)['mainEntity'] as Record<string, unknown>;

		expect(mainEntity['description']).toBeUndefined();
	});

	it('should forward the ISO datetime dates verbatim to dateCreated/dateModified', () => {
		const author = {
			...authorMock,
			createdAt: '2022-01-25T23:26:34Z' as IsoDateTime,
			updatedAt: '2026-06-09T00:32:32Z' as IsoDateTime,
		};

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
