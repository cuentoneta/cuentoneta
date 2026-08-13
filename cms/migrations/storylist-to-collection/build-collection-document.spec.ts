import { describe, expect, it } from 'vitest';

import type { PortableTextBlock } from '../../../resources/portable-text-to-markdown/portable-text-to-markdown';
import {
	buildCollectionDocument,
	collectionIdFor,
	isMigratedCollectionId,
	UnmigratableStorylistError,
	type StorylistDocument,
} from './build-collection-document';

const paragraph = (text: string, key = 'b1'): PortableTextBlock => ({
	_type: 'block',
	_key: key,
	style: 'normal',
	markDefs: [],
	children: [{ _type: 'span', _key: `${key}-s1`, text, marks: [] }],
});

const storylist = (overrides: Partial<StorylistDocument> = {}): StorylistDocument => ({
	_id: 'storylist-1',
	title: 'Geometrías del desvelo',
	slug: { _type: 'slug', current: 'geometrias-del-desvelo' },
	description: [paragraph('Prosa editorial de la colección.')],
	stories: [{ _type: 'reference', _ref: 'story-a', _key: 'k1' }],
	...overrides,
});

const reference = (
	overrides: Partial<{ _ref: string; _key: string; _weak: boolean; _strengthenOnPublish: unknown }>,
) => ({ _type: 'reference' as const, _ref: 'story-a', _key: 'k1', ...overrides });

describe('collectionIdFor', () => {
	// Las colecciones ya creadas dependen de que esta rama no se mueva: con `createIfNotExists`, un id
	// distinto las duplicaría en vez de reconocerlas.
	it('deriva el id de la colección del id de su storylist', () => {
		expect(collectionIdFor('abc-123')).toBe('collection-from-storylist-abc-123');
	});

	it('antepone el prefijo de borrador al derivar el id de un borrador', () => {
		expect(collectionIdFor('drafts.abc-123')).toBe('drafts.collection-from-storylist-abc-123');
	});

	// Concatenar sin separar el path deja un documento publicado con nombre de borrador.
	it('no deja el prefijo de borrador en medio del id', () => {
		expect(collectionIdFor('drafts.abc-123')).not.toBe('collection-from-storylist-drafts.abc-123');
		expect(collectionIdFor('drafts.abc-123').startsWith('drafts.')).toBe(true);
	});
});

describe('isMigratedCollectionId', () => {
	it('reconoce las dos formas del id derivado', () => {
		expect(isMigratedCollectionId('collection-from-storylist-abc')).toBe(true);
		expect(isMigratedCollectionId('drafts.collection-from-storylist-abc')).toBe(true);
	});

	// El predicado es lo que protege una colección creada a mano en el Studio de la reversión.
	it('no reconoce una colección ajena a la migración', () => {
		expect(isMigratedCollectionId('coleccion-escrita-a-mano')).toBe(false);
		expect(isMigratedCollectionId('drafts.coleccion-escrita-a-mano')).toBe(false);
		expect(isMigratedCollectionId('lw-from-story-abc')).toBe(false);
	});
});

describe('buildCollectionDocument', () => {
	it('deriva la identidad y el tipo del documento destino', () => {
		const result = buildCollectionDocument(storylist());

		expect(result._id).toBe('collection-from-storylist-storylist-1');
		expect(result._type).toBe('collection');
	});

	it('copia título y slug tal cual', () => {
		const result = buildCollectionDocument(storylist());

		expect(result.title).toBe('Geometrías del desvelo');
		expect(result.slug).toEqual({ _type: 'slug', current: 'geometrias-del-desvelo' });
	});

	it('convierte la descripción a Markdown preservando marcas y enlaces', () => {
		const description: PortableTextBlock[] = [
			{
				_type: 'block',
				_key: 'b1',
				style: 'normal',
				markDefs: [{ _key: 'l1', _type: 'link', href: 'https://ejemplo.test' }],
				children: [
					{ _type: 'span', _key: 's1', text: 'Una obra ', marks: [] },
					{ _type: 'span', _key: 's2', text: 'destacada', marks: ['strong'] },
					{ _type: 'span', _key: 's3', text: ' y ', marks: [] },
					{ _type: 'span', _key: 's4', text: 'matizada', marks: ['em'] },
					{ _type: 'span', _key: 's5', text: ', con enlace', marks: ['l1'] },
				],
			},
			paragraph('Segundo párrafo.', 'b2'),
		];

		const result = buildCollectionDocument(storylist({ description }));

		expect(result.description).toContain('**destacada**');
		expect(result.description).toContain('*matizada*');
		expect(result.description).toContain('](https://ejemplo.test)');
		expect(result.description).toContain('Segundo párrafo.');
	});

	// El reapuntado usa la misma derivación que creó las obras: una segunda noción de cómo se llama la
	// obra migrada produciría referencias rotas en silencio.
	it('reapunta cada historia a su obra migrada, en orden y con el _key de origen', () => {
		const result = buildCollectionDocument(
			storylist({
				stories: [reference({ _ref: 'story-a', _key: 'k1' }), reference({ _ref: 'story-b', _key: 'k2' })],
			}),
		);

		expect(result.literaryWorks).toEqual([
			{ _type: 'reference', _ref: 'lw-from-story-story-a', _key: 'k1' },
			{ _type: 'reference', _ref: 'lw-from-story-story-b', _key: 'k2' },
		]);
	});

	it('omite literaryWorks cuando la storylist no tiene historias', () => {
		expect(buildCollectionDocument(storylist({ stories: [] }))).not.toHaveProperty('literaryWorks');
		expect(buildCollectionDocument(storylist({ stories: undefined }))).not.toHaveProperty('literaryWorks');
	});

	// El campo no existe en el tipo destino. La aserción explícita evita que su ausencia se lea como un
	// olvido del mapeo.
	it('no traslada las pestañas del tipo de origen', () => {
		const withTabs = { ...storylist(), tabs: [{ _key: 't1', title: 'Pestaña' }] } as StorylistDocument;

		expect(buildCollectionDocument(withTabs)).not.toHaveProperty('tabs');
	});

	it('copia los campos que viajan sin transformar y omite los ausentes', () => {
		const featuredImage = { _type: 'image', asset: { _ref: 'image-abc' } };
		const config = { showAuthors: false };
		const tags = [reference({ _ref: 'tag-a', _key: 'tk1' })];

		const withAll = buildCollectionDocument(storylist({ featuredImage, config, tags }));
		const withNone = buildCollectionDocument(storylist());

		expect(withAll).toMatchObject({ featuredImage, config, tags });
		expect(withNone).not.toHaveProperty('featuredImage');
		expect(withNone).not.toHaveProperty('config');
		expect(withNone).not.toHaveProperty('tags');
	});

	it('omite los arrays que llegan vacíos en vez de escribirlos', () => {
		const result = buildCollectionDocument(storylist({ tags: [], mediaSources: [] }));

		expect(result).not.toHaveProperty('tags');
		expect(result).not.toHaveProperty('mediaSources');
	});
});

// La integridad referencial de la colección es un espejo exacto de la de su storylist: la migración no
// introduce debilidad ni la quita.
describe('buildCollectionDocument — debilidad de las referencias', () => {
	it('deja fuerte una referencia que el origen tiene fuerte', () => {
		const [work] = buildCollectionDocument(storylist()).literaryWorks as Record<string, unknown>[];

		expect(work).not.toHaveProperty('_weak');
		expect(work).not.toHaveProperty('_strengthenOnPublish');
	});

	it('conserva la debilidad que el origen declara', () => {
		const stories = [reference({ _weak: true })];

		const [work] = buildCollectionDocument(storylist({ stories })).literaryWorks as Record<string, unknown>[];

		expect(work._weak).toBe(true);
	});

	// El tipo del destino cambió: copiar la marca tal cual prometería fortalecer contra un `story` una
	// referencia que apunta a un `literaryWork`.
	it('retraduce _strengthenOnPublish al tipo del destino', () => {
		const stories = [reference({ _weak: true, _strengthenOnPublish: { type: 'story', template: { id: 'story' } } })];

		const [work] = buildCollectionDocument(storylist({ stories })).literaryWorks as Record<string, unknown>[];

		expect(work._strengthenOnPublish).toEqual({ type: 'literaryWork', template: { id: 'literaryWork' } });
	});

	it('no agrega _strengthenOnPublish cuando el origen no lo trae', () => {
		const stories = [reference({ _weak: true })];

		const [work] = buildCollectionDocument(storylist({ stories })).literaryWorks as Record<string, unknown>[];

		expect(work).not.toHaveProperty('_strengthenOnPublish');
	});
});

describe('buildCollectionDocument — datos que detienen la corrida', () => {
	it.each([
		['sin título', { title: undefined }, 'no tiene título'],
		['sin slug', { slug: undefined }, 'no tiene slug'],
		['sin descripción', { description: undefined }, 'no tiene descripción'],
		['con descripción vacía', { description: [] }, 'no tiene descripción'],
		['con una historia sin _key', { stories: [{ _type: 'reference' as const, _ref: 'story-a' }] }, 'sin _key'],
		['con un tag sin _key', { tags: [{ _type: 'reference' as const, _ref: 'tag-a' }] }, 'sin _key'],
		['con un recurso sin _key', { mediaSources: [{ _type: 'audioRecording' }] }, 'sin _key'],
	])('aborta con una storylist %s', (_caso, overrides, expected) => {
		expect(() => buildCollectionDocument(storylist(overrides as Partial<StorylistDocument>))).toThrow(expected);
	});

	it('identifica la storylist en el mensaje y usa el error tipado', () => {
		expect(() => buildCollectionDocument(storylist({ title: undefined }))).toThrow(UnmigratableStorylistError);
		expect(() => buildCollectionDocument(storylist({ title: undefined }))).toThrow('storylist-1');
	});

	// Sin el guard, la derivación trataría el `_ref` como un id de borrador y produciría un destino con
	// `drafts.` adelante, que no es una referencia válida. Ningún `_ref` del corpus lo tiene: el guard
	// convierte una corrupción silenciosa en una detención.
	it('aborta ante una referencia que apunta a un borrador', () => {
		const stories = [reference({ _ref: 'drafts.story-a' })];

		expect(() => buildCollectionDocument(storylist({ stories }))).toThrow('apunta a un borrador');
	});

	it('propaga el error del conversor ante Portable Text no soportado', () => {
		const description = [
			{ _type: 'block', _key: 'b1', style: 'h1', markDefs: [], children: [] },
		] as PortableTextBlock[];

		expect(() => buildCollectionDocument(storylist({ description }))).toThrow();
	});
});
