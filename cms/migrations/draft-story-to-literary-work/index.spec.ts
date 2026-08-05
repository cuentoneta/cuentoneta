import { describe, expect, it } from 'vitest';

import type { PortableTextBlock } from '../../../resources/portable-text-to-markdown/portable-text-to-markdown';
import type { StoryDocument } from '../story-to-literary-work/build-literary-work-document';
import migration from './index';

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

const draftStory = (overrides: Partial<StoryDocument> = {}): StoryDocument => ({
	_id: 'drafts.story-1',
	_createdAt: '2022-01-06T04:48:27Z',
	title: 'El aleph',
	slug: { _type: 'slug', current: 'el-aleph' },
	author: { _type: 'reference', _ref: 'author-borges' },
	body: [paragraph('El cuerpo.')],
	...overrides,
});

describe('migración de cuentos en borrador a obras en borrador', () => {
	it('alcanza solo a los cuentos', () => {
		expect(migration.documentTypes).toEqual(['story']);
	});

	// El filtro se afirma entero y no condición por condición: es la unidad que decide qué entra, y
	// partirlo daría la ilusión de cobertura sin agregar ninguna.
	it('deja fuera los borradores que no permiten construir una obra', () => {
		expect(migration.filter).toBe(
			"_id in path('drafts.**') && defined(title) && defined(slug.current) && defined(author._ref) && count(body) > 0",
		);
	});

	it('emite una única mutación de creación por cuento', () => {
		expect(migrateDocument(draftStory())).toHaveLength(1);
	});

	// La mutación apunta a OTRO documento: itera cuentos y crea obras. El cuento queda intacto. Y es
	// `createIfNotExists` y no `createOrReplace`: repetir la corrida no debe pisar lo que alguien haya
	// editado a mano en la obra después de migrarla.
	it('crea la obra en borrador sin tocar el cuento de origen', () => {
		const [mutation] = migrateDocument(draftStory()) as { type: string; document: { _id: string; _type: string } }[];

		expect(mutation?.type).toBe('createIfNotExists');
		expect(mutation?.document._id).toBe('drafts.lw-from-story-story-1');
		expect(mutation?.document._type).toBe('literaryWork');
	});

	// Lo que impide que la corrida publique contenido inédito.
	it('deriva un identificador que Sanity lee como borrador', () => {
		const [mutation] = migrateDocument(draftStory()) as { document: { _id: string } }[];

		expect(mutation?.document._id.startsWith('drafts.')).toBe(true);
	});

	it('lleva el contenido convertido a la obra creada', () => {
		const [mutation] = migrateDocument(
			draftStory({ body: [paragraph('Texto.')], review: [paragraph('Una reseña.')] }),
		) as { document: Record<string, unknown> }[];
		const content = mutation?.document['content'] as Record<string, unknown>[];

		expect(content[0]?.['body']).toBe('Texto.');
		expect(mutation?.document['editorialNote']).toBe('Una reseña.');
	});

	// Defensa en profundidad: el filtro no debería entregar un cuento así, pero si lo hiciera —otro
	// filtro en la invocación, un cambio en el runner— la corrida se detiene en vez de escribir una
	// obra degradada que fallaría recién al leerse.
	it('propaga el error del mapeo ante un cuento incompleto', () => {
		expect(() => migrateDocument(draftStory({ author: undefined }))).toThrow(/no tiene autor/);
	});

	it('propaga el error del conversor ante una construcción no soportada', () => {
		const exotico = { ...paragraph('Texto'), style: 'inventado' };

		expect(() => migrateDocument(draftStory({ body: [exotico] }))).toThrow(/Estilo no soportado/);
	});
});
