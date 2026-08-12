import { evaluate, parse } from 'groq-js';
import { describe, expect, it } from 'vitest';

import type { PortableTextBlock } from '../../../resources/portable-text-to-markdown/portable-text-to-markdown';
import { type StorylistDocument } from './build-collection-document';
import migration from './index';

// `defineMigration` conserva el objeto tal cual, así que `migrate.document` es una función pura y es
// lo único que hace falta ejercitar: decide qué mutación emite cada storylist.
const migrateDocument = (doc: StorylistDocument) => {
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

const publishedStorylist = (overrides: Partial<StorylistDocument> = {}): StorylistDocument => ({
	_id: 'storylist-1',
	title: 'Geometrías del desvelo',
	slug: { _type: 'slug', current: 'geometrias-del-desvelo' },
	description: [paragraph('Prosa editorial.')],
	stories: [{ _type: 'reference', _ref: 'story-a', _key: 'k1' }],
	...overrides,
});

describe('migración de storylists publicadas a colecciones', () => {
	it('alcanza solo a las storylists', () => {
		expect(migration.documentTypes).toEqual(['storylist']);
	});

	// El filtro se ejecuta con el mismo motor que GROQ, no se compara como texto: una aserción textual
	// pasa igual con un filtro roto mientras el literal coincida.
	describe('el filtro decide qué entra', () => {
		const matching = async (...docs: Record<string, unknown>[]) => {
			const result = await evaluate(parse(`*[${migration.filter}]._id`), { dataset: docs });
			return (await result.get()) as string[];
		};

		it('admite una storylist publicada', async () => {
			expect(await matching({ _id: 'publicada', _type: 'storylist' })).toEqual(['publicada']);
		});

		// El ámbito de borradores tiene su propia migración, con la postura opuesta ante un dato incompleto.
		it('deja fuera un borrador', async () => {
			expect(await matching({ _id: 'drafts.borrador', _type: 'storylist' })).toEqual([]);
		});
	});

	it('emite una única mutación de creación por storylist', () => {
		expect(migrateDocument(publishedStorylist())).toHaveLength(1);
	});

	// La mutación apunta a OTRO documento: itera storylists y crea colecciones. La storylist queda
	// intacta. Y es `createIfNotExists` y no `createOrReplace`: repetir la corrida no debe pisar lo que
	// alguien haya editado a mano en la colección después de migrarla.
	it('crea la colección sin tocar la storylist de origen', () => {
		const [mutation] = migrateDocument(publishedStorylist()) as {
			type: string;
			document: { _id: string; _type: string };
		}[];

		expect(mutation?.type).toBe('createIfNotExists');
		expect(mutation?.document._id).toBe('collection-from-storylist-storylist-1');
		expect(mutation?.document._type).toBe('collection');
	});

	it('lleva la descripción convertida y las obras reapuntadas', () => {
		const [mutation] = migrateDocument(publishedStorylist()) as { document: Record<string, unknown> }[];
		const works = mutation?.document['literaryWorks'] as Record<string, unknown>[];

		expect(mutation?.document['description']).toBe('Prosa editorial.');
		expect(works[0]?.['_ref']).toBe('lw-from-story-story-a');
	});

	// En este ámbito abortar es la conducta deseada: una storylist publicada incompleta es un error del
	// dataset, y saltearla dejaría el corpus a medio migrar sin señal.
	it('propaga el error del mapeo ante una storylist incompleta', () => {
		expect(() => migrateDocument(publishedStorylist({ description: undefined }))).toThrow(/no tiene descripción/);
	});

	it('propaga el error del conversor ante una construcción no soportada', () => {
		const exotico = { ...paragraph('Texto'), style: 'inventado' };

		expect(() => migrateDocument(publishedStorylist({ description: [exotico] }))).toThrow(/Estilo no soportado/);
	});
});
