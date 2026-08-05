import { authorMock } from '@mocks/author.mock';
import { createMarkdown } from '@models/markdown.model';
import { createSanitizedHtml } from '@models/sanitized-html.model';
import type { IsoDateTime } from '@utils/date.utils';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';

import { assertValidJsonLd } from '@testing/json-ld-validation';
import { buildAuthorBreadcrumb, buildAuthorProfilePageSchema } from './author.schema';

describe('buildAuthorProfilePageSchema', () => {
	const websiteUrl = 'https://www.cuentoneta.ar/';

	it('should build a schema.org-valid ProfilePage', async () => {
		await expect(assertValidJsonLd(buildAuthorProfilePageSchema(authorMock, websiteUrl))).resolves.toBeUndefined();
	});

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

	it('should flatten the biography HTML into the Person description', () => {
		const biography = markdownToSanitizedHtml(createMarkdown('Primera **oración**.\n\nSegunda _oración_.'));
		const author = { ...authorMock, biography };

		const mainEntity = buildAuthorProfilePageSchema(author, websiteUrl)['mainEntity'] as Record<string, unknown>;

		expect(mainEntity['description'], 'une el texto de cada bloque separándolos con un espacio').toBe(
			'Primera oración. Segunda oración.',
		);
	});

	it('should truncate a long biography description at a word boundary with an ellipsis', () => {
		const fitsBeforeLimit = 'a'.repeat(295);
		const author = { ...authorMock, biography: createSanitizedHtml(`<p>${fitsBeforeLimit} palabraDescartada</p>`) };

		const mainEntity = buildAuthorProfilePageSchema(author, websiteUrl)['mainEntity'] as Record<string, unknown>;

		expect(mainEntity['description'], 'corta en el espacio previo al tope de 300 y descarta la palabra parcial').toBe(
			`${fitsBeforeLimit}…`,
		);
	});

	it('should hard-cut at the max length when there is no space within the limit', () => {
		const singleLongWord = 'b'.repeat(350);
		const author = { ...authorMock, biography: createSanitizedHtml(`<p>${singleLongWord}</p>`) };

		const mainEntity = buildAuthorProfilePageSchema(author, websiteUrl)['mainEntity'] as Record<string, unknown>;

		expect(mainEntity['description'], 'sin límite de palabra, cae al tope duro de 300 caracteres + elipsis').toBe(
			`${'b'.repeat(300)}…`,
		);
	});

	it('should keep the text of inline marks without detaching punctuation', () => {
		const biography = markdownToSanitizedHtml(createMarkdown('Su novela _Geometría_ y el **ensayo**.'));
		const author = { ...authorMock, biography };

		const mainEntity = buildAuthorProfilePageSchema(author, websiteUrl)['mainEntity'] as Record<string, unknown>;

		expect(mainEntity['description']).toBe('Su novela Geometría y el ensayo.');
	});

	it('should separate text split by a line break inside the same block', () => {
		const author = { ...authorMock, biography: createSanitizedHtml('<p>Chateauroux, 1948<br />París, 1994</p>') };

		const mainEntity = buildAuthorProfilePageSchema(author, websiteUrl)['mainEntity'] as Record<string, unknown>;

		expect(mainEntity['description']).toBe('Chateauroux, 1948 París, 1994');
	});

	// El HTML de estos casos parte del Markdown y no está autorado a mano: la forma exacta de las
	// referencias de caracteres la decide el pipeline, y una aserción sobre HTML escrito acá no
	// detectaría que dejó de coincidir.
	describe('referencias de caracteres', () => {
		const descriptionFrom = (markdown: string) => {
			const author = { ...authorMock, biography: markdownToSanitizedHtml(createMarkdown(markdown)) };
			return (buildAuthorProfilePageSchema(author, websiteUrl)['mainEntity'] as Record<string, unknown>)['description'];
		};

		it('should decode the references the pipeline emits', () => {
			expect(descriptionFrom('Ida & vuelta')).toBe('Ida & vuelta');
			expect(descriptionFrom('Entre \\< y \\> hay una pausa')).toBe('Entre < y > hay una pausa');
		});

		it('should leave no unresolved reference in the description', () => {
			expect(descriptionFrom('Ida & vuelta: \\<pausa\\>, "dijo" y punto.')).not.toMatch(/&#|&[a-z]+;/i);
		});

		it('should decode named and numeric references alike', () => {
			const author = {
				...authorMock,
				biography: createSanitizedHtml('<p>Ida &amp; vuelta &#38; regreso: &#x3C;pausa&gt;</p>'),
			};

			const mainEntity = buildAuthorProfilePageSchema(author, websiteUrl)['mainEntity'] as Record<string, unknown>;

			expect(mainEntity['description']).toBe('Ida & vuelta & regreso: <pausa>');
		});

		it('should not decode an escaped reference twice', () => {
			const author = { ...authorMock, biography: createSanitizedHtml('<p>Se escribe &amp;lt; para un menor.</p>') };

			const mainEntity = buildAuthorProfilePageSchema(author, websiteUrl)['mainEntity'] as Record<string, unknown>;

			expect(mainEntity['description']).toBe('Se escribe &lt; para un menor.');
		});
	});

	// El barrido de tags corta en el primer `>`, aunque venga dentro de un valor de atributo. El pipeline
	// no emite un `>` sin escapar ahí, así que la limitación queda enunciada, no manejada.
	it('should truncate a tag whose attribute carries an unescaped greater-than sign', () => {
		const author = { ...authorMock, biography: createSanitizedHtml('<p><img alt="a > b"/>Texto</p>') };

		const mainEntity = buildAuthorProfilePageSchema(author, websiteUrl)['mainEntity'] as Record<string, unknown>;

		expect(mainEntity['description']).toBe('b"/>Texto');
	});

	it('should collapse an empty block when flattening the biography', () => {
		const author = {
			...authorMock,
			biography: createSanitizedHtml('<p></p><p>Biografía sin bloque vacío previo.</p>'),
		};

		const mainEntity = buildAuthorProfilePageSchema(author, websiteUrl)['mainEntity'] as Record<string, unknown>;

		expect(mainEntity['description'], 'el bloque vacío no agrega espacios ni artefactos al aplanar').toBe(
			'Biografía sin bloque vacío previo.',
		);
	});

	// La biografía es requerida en el schema y `SanitizedHtml` no admite un valor vacío, así que la vía
	// por la que el `description` puede quedar sin texto es un HTML válido cuyo contenido no es prosa.
	it('should omit the description in mainEntity when the biography HTML carries no text', () => {
		const author = {
			...authorMock,
			biography: createSanitizedHtml('<p><img src="https://cdn.sanity.io/foto.jpg" alt="Foto"/></p>'),
		};

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
			{ '@type': 'ListItem', position: 1, name: 'Inicio', item: { '@id': 'https://www.cuentoneta.ar/home' } },
			{ '@type': 'ListItem', position: 2, name: 'Autores', item: { '@id': 'https://www.cuentoneta.ar/authors' } },
			{
				'@type': 'ListItem',
				position: 3,
				name: 'François Onoff',
				item: { '@id': 'https://www.cuentoneta.ar/author/francois-onoff' },
			},
		]);
	});

	it('should build a schema.org-valid BreadcrumbList', async () => {
		await expect(
			assertValidJsonLd(buildAuthorBreadcrumb(authorMock, 'https://www.cuentoneta.ar/')),
		).resolves.toBeUndefined();
	});
});
