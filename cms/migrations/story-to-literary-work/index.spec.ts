import { describe, expect, it } from 'vitest';

import type { PortableTextBlock } from '../../../resources/portable-text-to-markdown/portable-text-to-markdown';
import migration from './index';
import type { StoryDocument } from './build-literary-work-document';

// `defineMigration` conserva el objeto tal cual, así que `migrate.document` es una función pura y es
// lo único que hace falta ejercitar: decide qué mutación emite cada cuento.
const migrateDocument = (doc: StoryDocument) => {
	const document = migration.migrate?.document;
	if (!document) throw new Error('La migración no define migrate.document');
	return document(doc as never);
};

const paragraph = (text: string): PortableTextBlock => ({
	_type: 'block',
	_key: 'b1',
	style: 'normal',
	markDefs: [],
	children: [{ _type: 'span', _key: 's1', text, marks: [] }],
});

const story = (overrides: Partial<StoryDocument> = {}): StoryDocument => ({
	_id: 'story-1',
	_createdAt: '2022-01-06T04:48:27Z',
	title: 'El aleph',
	slug: { _type: 'slug', current: 'el-aleph' },
	author: { _type: 'reference', _ref: 'author-borges' },
	body: [paragraph('El cuerpo.')],
	...overrides,
});

describe('migración de cuentos a obras', () => {
	it('alcanza solo a los cuentos publicados', () => {
		expect(migration.documentTypes).toEqual(['story']);
		expect(migration.filter).toBe("!(_id in path('drafts.**'))");
	});

	it('emite una única mutación de creación por cuento', () => {
		const mutations = migrateDocument(story());

		expect(Array.isArray(mutations)).toBe(true);
		expect(mutations).toHaveLength(1);
	});

	// La mutación apunta a OTRO documento: itera cuentos y crea obras. El cuento queda intacto.
	it('crea la obra sin tocar el cuento de origen', () => {
		const [mutation] = migrateDocument(story()) as { type: string; document: { _id: string; _type: string } }[];

		expect(mutation?.type).toBe('createIfNotExists');
		expect(mutation?.document._id).toBe('lw-from-story-story-1');
		expect(mutation?.document._type).toBe('literaryWork');
	});

	// `createIfNotExists` y no `createOrReplace`: repetir la corrida no debe pisar lo que alguien haya
	// editado a mano en la obra después de migrarla.
	it('usa una mutación que no pisa una obra ya existente', () => {
		const [mutation] = migrateDocument(story()) as { type: string }[];

		expect(mutation?.type).not.toBe('createOrReplace');
	});

	it('lleva el contenido convertido a la obra creada', () => {
		const [mutation] = migrateDocument(story({ body: [paragraph('Texto.')], review: [paragraph('Una reseña.')] })) as {
			document: Record<string, unknown>;
		}[];
		const content = mutation?.document['content'] as Record<string, unknown>[];

		expect(content[0]?.['body']).toBe('Texto.');
		expect(mutation?.document['editorialNote']).toBe('Una reseña.');
	});

	// Detenerse identificando el documento es preferible a escribir una obra degradada: el error llega
	// donde se puede corregir, y no al leer el agregado mucho después.
	it('propaga el error del conversor ante una construcción no soportada', () => {
		const exotico = { ...paragraph('Texto'), style: 'inventado' };

		expect(() => migrateDocument(story({ body: [exotico] }))).toThrow(/Estilo no soportado/);
	});

	it('propaga el error del mapeo ante un cuento incompleto', () => {
		expect(() => migrateDocument(story({ author: undefined }))).toThrow(/no tiene autor/);
	});
});
