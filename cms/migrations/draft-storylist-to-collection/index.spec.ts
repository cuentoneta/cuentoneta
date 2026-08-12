import { evaluate, parse } from 'groq-js';
import { describe, expect, it } from 'vitest';

import type { PortableTextBlock } from '../../../resources/portable-text-to-markdown/portable-text-to-markdown';
import { type StorylistDocument } from '../storylist-to-collection/build-collection-document';
import migration from './index';

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

const draftStorylist = (overrides: Partial<StorylistDocument> = {}): StorylistDocument => ({
	_id: 'drafts.storylist-1',
	title: 'Cuentos originales',
	slug: { _type: 'slug', current: 'cuentos-originales' },
	description: [paragraph('Prosa editorial.')],
	stories: [{ _type: 'reference', _ref: 'story-a', _key: 'k1' }],
	...overrides,
});

describe('migración de storylists en borrador a colecciones en borrador', () => {
	it('alcanza solo a las storylists', () => {
		expect(migration.documentTypes).toEqual(['storylist']);
	});

	// El filtro se ejecuta con el mismo motor que GROQ, no se compara como texto: una aserción textual
	// pasa igual con un filtro roto mientras el literal coincida, y no distingue `count(x) > 0` de
	// `count(x) >= 0` ni dice qué hace ante un campo ausente, que es el caso frecuente en un borrador.
	describe('el filtro decide qué entra', () => {
		const admitido = {
			_id: 'drafts.ok',
			_type: 'storylist',
			title: 'T',
			slug: { current: 't' },
			description: [{}],
			stories: [{}],
		};

		const matching = async (...docs: Record<string, unknown>[]) => {
			const result = await evaluate(parse(`*[${migration.filter}]._id`), { dataset: docs });
			return (await result.get()) as string[];
		};

		it('admite un borrador completo', async () => {
			expect(await matching(admitido)).toEqual(['drafts.ok']);
		});

		it('deja fuera una storylist publicada', async () => {
			expect(await matching({ ...admitido, _id: 'publicada' })).toEqual([]);
		});

		it('deja fuera un borrador sin descripción, esté ausente o vacía', async () => {
			const sinCampo = { ...admitido, _id: 'drafts.sin-campo', description: undefined };
			const vacia = { ...admitido, _id: 'drafts.vacia', description: [] };

			expect(await matching(sinCampo, vacia)).toEqual([]);
		});

		// La condición no sale del schema del Studio, que declara las obras opcionales, sino de la factory
		// del dominio, que exige al menos una. Sin ella se escribiría un documento que el dominio nunca
		// puede construir, y la falla aparecería al mapear en vez de en la migración.
		it('deja fuera un borrador sin obras, esté ausente o vacío', async () => {
			const sinCampo = { ...admitido, _id: 'drafts.sin-obras', stories: undefined };
			const vacio = { ...admitido, _id: 'drafts.obras-vacias', stories: [] };

			expect(await matching(sinCampo, vacio)).toEqual([]);
		});

		it('deja fuera un borrador sin título o sin slug', async () => {
			const sinTitulo = { ...admitido, _id: 'drafts.sin-titulo', title: undefined };
			const sinSlug = { ...admitido, _id: 'drafts.sin-slug', slug: undefined };

			expect(await matching(sinTitulo, sinSlug)).toEqual([]);
		});
	});

	it('crea la colección en borrador sin tocar la storylist de origen', () => {
		const [mutation] = migrateDocument(draftStorylist()) as {
			type: string;
			document: { _id: string; _type: string };
		}[];

		expect(mutation?.type).toBe('createIfNotExists');
		expect(mutation?.document._id).toBe('drafts.collection-from-storylist-storylist-1');
		expect(mutation?.document._type).toBe('collection');
	});

	// Lo que impide que la corrida publique contenido inédito.
	it('deriva un identificador que Sanity lee como borrador', () => {
		const [mutation] = migrateDocument(draftStorylist()) as { document: { _id: string } }[];

		expect(mutation?.document._id.startsWith('drafts.')).toBe(true);
	});

	// Defensa en profundidad: el filtro no debería entregar una storylist así, pero si lo hiciera —otro
	// filtro en la invocación, un cambio en el runner— la corrida se detiene en vez de escribir una
	// colección degradada que fallaría recién al leerse.
	it('propaga el error del mapeo ante un borrador incompleto', () => {
		expect(() => migrateDocument(draftStorylist({ title: undefined }))).toThrow(/no tiene título/);
	});
});
