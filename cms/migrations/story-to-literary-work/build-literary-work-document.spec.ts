import { describe, expect, it } from 'vitest';

import type { PortableTextBlock } from '../../../resources/portable-text-to-markdown/portable-text-to-markdown';
import {
	buildLiteraryWorkDocument,
	isMigratedLiteraryWorkId,
	literaryWorkIdFor,
	UnmigratableStoryError,
	type StoryDocument,
} from './build-literary-work-document';

const paragraph = (text: string, key = 'b1'): PortableTextBlock => ({
	_type: 'block',
	_key: key,
	style: 'normal',
	markDefs: [],
	children: [{ _type: 'span', _key: `${key}-s1`, text, marks: [] }],
});

const story = (overrides: Partial<StoryDocument> = {}): StoryDocument => ({
	_id: 'story-1',
	_createdAt: '2022-01-06T04:48:27Z',
	title: 'El aleph',
	slug: { _type: 'slug', current: 'el-aleph' },
	author: { _type: 'reference', _ref: 'author-borges' },
	body: [paragraph('El cuerpo de la obra.')],
	originalPublication: 'Sur, 1945',
	...overrides,
});

describe('literaryWorkIdFor', () => {
	// Las obras ya creadas dependen de que esta rama no se mueva: con `createIfNotExists`, un id
	// distinto las duplicaría en vez de reconocerlas.
	it('deriva el id de la obra del id de su story', () => {
		expect(literaryWorkIdFor('abc-123')).toBe('lw-from-story-abc-123');
	});

	it('antepone el prefijo de borrador al derivar el id de un borrador', () => {
		expect(literaryWorkIdFor('drafts.abc-123')).toBe('drafts.lw-from-story-abc-123');
	});

	// Concatenar sin separar el path deja un documento publicado con nombre de borrador.
	it('no deja el prefijo de borrador en medio del id', () => {
		expect(literaryWorkIdFor('drafts.abc-123')).not.toBe('lw-from-story-drafts.abc-123');
		expect(literaryWorkIdFor('drafts.abc-123').startsWith('drafts.')).toBe(true);
	});

	it('trata como publicado un id donde "drafts." no encabeza', () => {
		expect(literaryWorkIdFor('story-drafts.1')).toBe('lw-from-story-story-drafts.1');
	});

	// La reversión filtra por este predicado: si tuviera su propia noción de "documento migrado",
	// podría borrar una obra nacida en el Studio.
	it('reconoce solo los ids derivados', () => {
		expect(isMigratedLiteraryWorkId('lw-from-story-abc')).toBe(true);
		expect(isMigratedLiteraryWorkId('drafts.lw-from-story-abc')).toBe(true);
		expect(isMigratedLiteraryWorkId('una-obra-del-studio')).toBe(false);
		expect(isMigratedLiteraryWorkId('drafts.una-obra-del-studio')).toBe(false);
		expect(isMigratedLiteraryWorkId('obra-lw-from-story-suelta')).toBe(false);
		expect(isMigratedLiteraryWorkId('drafts.obra-lw-from-story-suelta')).toBe(false);
	});

	// La invariante de la que depende la reversión para alcanzar todo lo que la migración crea.
	it('reconoce lo que deriva, publicado o en borrador', () => {
		expect(isMigratedLiteraryWorkId(literaryWorkIdFor('abc-123'))).toBe(true);
		expect(isMigratedLiteraryWorkId(literaryWorkIdFor('drafts.abc-123'))).toBe(true);
	});
});

describe('buildLiteraryWorkDocument', () => {
	it('deriva el id y el tipo del documento destino', () => {
		const doc = buildLiteraryWorkDocument(story());

		expect(doc['_id']).toBe('lw-from-story-story-1');
		expect(doc['_type']).toBe('literaryWork');
	});

	it('deriva un id bajo drafts. cuando el cuento es un borrador', () => {
		const doc = buildLiteraryWorkDocument(story({ _id: 'drafts.story-1' }));

		expect(doc['_id']).toBe('drafts.lw-from-story-story-1');
	});

	// El estado de publicación no cambia nada más del documento: el borrador de un cuento produce el
	// borrador de la misma obra, no una obra distinta.
	it('produce el mismo documento que su contraparte publicada salvo el id', () => {
		const sinId = (doc: Record<string, unknown>) =>
			Object.fromEntries(Object.entries(doc).filter(([k]) => k !== '_id'));

		const publicada = buildLiteraryWorkDocument(story({ _id: 'story-1' }));
		const borrador = buildLiteraryWorkDocument(story({ _id: 'drafts.story-1' }));

		expect(sinId(borrador)).toEqual(sinId(publicada));
	});

	it('copia título y slug tal cual', () => {
		const doc = buildLiteraryWorkDocument(story());

		expect(doc['title']).toBe('El aleph');
		expect(doc['slug']).toEqual({ _type: 'slug', current: 'el-aleph' });
	});

	// `Story.author` es una referencia única; `LiteraryWork.authors` un array. La invariante del
	// agregado exige al menos un autor.
	it('envuelve el autor único en un array con su _key derivado', () => {
		const doc = buildLiteraryWorkDocument(story());

		expect(doc['authors']).toEqual([{ _type: 'reference', _ref: 'author-borges', _key: 'author-borges' }]);
	});

	describe('sección única', () => {
		it('lleva el cuerpo convertido a Markdown a la primera y única sección', () => {
			const doc = buildLiteraryWorkDocument(story({ body: [paragraph('Texto con *asterisco*.')] }));
			const content = doc['content'] as Record<string, unknown>[];

			expect(content).toHaveLength(1);
			expect(content[0]?.['body']).toBe('Texto con \\*asterisco\\*.');
		});

		// Sin origen en `Story`: el schema lo declara opcional y la vista de lectura lo consume con
		// optional chaining. Se afirma para que la ausencia no se lea como un olvido.
		it('deja la sección sin título', () => {
			const content = buildLiteraryWorkDocument(story())['content'] as Record<string, unknown>[];

			expect(content[0]).not.toHaveProperty('title');
		});

		it('lleva los epígrafes a esa misma sección, preservando su _key', () => {
			const doc = buildLiteraryWorkDocument(
				story({
					epigraphs: [{ _key: 'ep1', text: [paragraph('Cita')], reference: [paragraph('Autor')] }],
				}),
			);
			const content = doc['content'] as Record<string, unknown>[];

			expect(content[0]?.['epigraphs']).toEqual([{ _key: 'ep1', text: 'Cita', reference: 'Autor' }]);
		});

		it('omite la clave de epígrafes cuando la story no tiene', () => {
			const content = buildLiteraryWorkDocument(story())['content'] as Record<string, unknown>[];

			expect(content[0]).not.toHaveProperty('epigraphs');
		});

		it('omite la referencia del epígrafe cuando falta', () => {
			const doc = buildLiteraryWorkDocument(story({ epigraphs: [{ _key: 'ep1', text: [paragraph('Cita')] }] }));
			const content = doc['content'] as Record<string, unknown>[];

			expect((content[0]?.['epigraphs'] as unknown[])[0]).not.toHaveProperty('reference');
		});
	});

	describe('nota editorial', () => {
		it('toma la reseña de la story convertida a Markdown', () => {
			const doc = buildLiteraryWorkDocument(story({ review: [paragraph('Una reseña.')] }));

			expect(doc['editorialNote']).toBe('Una reseña.');
		});

		// 47 de 613 stories no tienen reseña. Las factories del dominio rechazan contenido vacío, así
		// que la clave ausente es un estado válido del agregado y el string vacío no lo es.
		it('omite la clave cuando la story no tiene reseña', () => {
			expect(buildLiteraryWorkDocument(story())).not.toHaveProperty('editorialNote');
		});

		it('omite la clave cuando la reseña queda vacía al convertirla', () => {
			expect(buildLiteraryWorkDocument(story({ review: [paragraph('   ')] }))).not.toHaveProperty('editorialNote');
		});
	});

	describe('fecha de publicación', () => {
		it('copia publishedAt cuando la story lo tiene', () => {
			const doc = buildLiteraryWorkDocument(story({ publishedAt: '2024-03-15T09:00:00Z' }));

			expect(doc['publishedAt']).toBe('2024-03-15T09:00:00Z');
		});

		// 581 de 613 stories no lo tienen. Omitirlo haría que el `coalesce(publishedAt, _createdAt)` de
		// la query resolviera al `_createdAt` del documento NUEVO, o sea la fecha de la migración.
		it('cae al _createdAt de la story cuando falta', () => {
			expect(buildLiteraryWorkDocument(story())['publishedAt']).toBe('2022-01-06T04:48:27Z');
		});
	});

	// El reading time lo puebla el backfill, que es la única vía de persistencia de ese campo. Copiar
	// `approximateReadingTime` sembraría un valor computado con otro algoritmo que el backfill, por ser
	// `setIfMissing`, nunca corregiría.
	it('no escribe tiempos de lectura', () => {
		const doc = buildLiteraryWorkDocument(story());
		const content = doc['content'] as Record<string, unknown>[];

		expect(doc).not.toHaveProperty('totalReadingTime');
		expect(content[0]).not.toHaveProperty('readingTime');
	});

	describe('campos que viajan sin transformar', () => {
		it('copia los que la story tiene', () => {
			const doc = buildLiteraryWorkDocument(
				story({
					coverImage: { _type: 'image' },
					tags: [{ _type: 'reference', _ref: 'tag-1', _key: 'k1' }],
					badLanguage: true,
				}),
			);

			expect(doc['coverImage']).toEqual({ _type: 'image' });
			expect(doc['tags']).toEqual([{ _type: 'reference', _ref: 'tag-1', _key: 'k1' }]);
			expect(doc['badLanguage']).toBe(true);
			expect(doc['originalPublication']).toBe('Sur, 1945');
		});

		it('omite los que la story no tiene, en vez de escribirlos vacíos', () => {
			const doc = buildLiteraryWorkDocument(story());

			expect(doc).not.toHaveProperty('coverImage');
			expect(doc).not.toHaveProperty('tags');
			expect(doc).not.toHaveProperty('mediaSources');
			expect(doc).not.toHaveProperty('resources');
		});
	});

	// Un documento degradado fallaría recién al leerse, cuando el repository construya el agregado con
	// sus factories. Abortar acá deja el error donde se puede corregir.
	describe('datos que impiden construir una obra válida', () => {
		it.each([
			['sin título', { title: undefined }, /no tiene título/],
			['sin slug', { slug: undefined }, /no tiene slug/],
			['sin autor', { author: undefined }, /no tiene autor/],
			['sin cuerpo', { body: undefined }, /"body" quedó vacío/],
			['con cuerpo en blanco', { body: [paragraph('   ')] }, /"body" quedó vacío/],
		])('aborta %s', (_caso, overrides, mensaje) => {
			expect(() => buildLiteraryWorkDocument(story(overrides as Partial<StoryDocument>))).toThrow(mensaje);
		});

		it('aborta ante un epígrafe sin texto', () => {
			expect(() => buildLiteraryWorkDocument(story({ epigraphs: [{ _key: 'ep1' }] }))).toThrow(
				/"epigraphs\[0\]\.text" quedó vacío/,
			);
		});

		// Sanity rechaza el documento si un miembro de array no tiene _key, y los documentos viejos del
		// corpus pueden no tenerlo.
		it.each([
			['epígrafes', { epigraphs: [{ text: [paragraph('Cita')] }] }, /epígrafe 0 no tiene _key/],
			['tags', { tags: [{ _type: 'reference' as const, _ref: 'tag-1' }] }, /"tags" sin _key/],
			['multimedia', { mediaSources: [{}] }, /"mediaSources" sin _key/],
		])('aborta ante %s sin _key', (_caso, overrides, mensaje) => {
			expect(() => buildLiteraryWorkDocument(story(overrides as Partial<StoryDocument>))).toThrow(mensaje);
		});

		it('identifica la story en el mensaje del error', () => {
			expect(() => buildLiteraryWorkDocument(story({ _id: 'story-99', title: undefined }))).toThrow(/story "story-99"/);
		});

		it('usa un error propio para poder distinguirlo', () => {
			expect(() => buildLiteraryWorkDocument(story({ title: undefined }))).toThrow(UnmigratableStoryError);
		});
	});
});
