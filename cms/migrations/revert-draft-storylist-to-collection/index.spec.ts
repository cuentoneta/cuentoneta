import { evaluate, parse } from 'groq-js';
import { describe, expect, it } from 'vitest';

import migration from './index';

const migrateDocument = (doc: { _id: string }) => {
	const document = migration.migrate?.document;
	if (!document) throw new Error('La migración no define migrate.document');
	return document(doc as never);
};

describe('reversión acotada de colecciones en borrador', () => {
	it('alcanza solo a las colecciones', () => {
		expect(migration.documentTypes).toEqual(['collection']);
	});

	describe('el filtro decide qué entra', () => {
		const matching = async (...docs: Record<string, unknown>[]) => {
			const result = await evaluate(parse(`*[${migration.filter}]._id`), { dataset: docs });
			return (await result.get()) as string[];
		};

		it('admite una colección migrada en borrador', async () => {
			const borrador = { _id: 'drafts.collection-from-storylist-abc', _type: 'collection' };

			expect(await matching(borrador)).toEqual([borrador._id]);
		});

		// Es la razón de existir de esta reversión: la amplia se llevaría el corpus publicado.
		it('deja fuera una colección migrada publicada', async () => {
			expect(await matching({ _id: 'collection-from-storylist-abc', _type: 'collection' })).toEqual([]);
		});

		it('deja fuera un borrador ajeno a la migración', async () => {
			expect(await matching({ _id: 'drafts.coleccion-escrita-a-mano', _type: 'collection' })).toEqual([]);
		});
	});

	it('borra la colección en borrador que nació de la migración', () => {
		const [mutation] = migrateDocument({ _id: 'drafts.collection-from-storylist-abc' }) as { type: string }[];

		expect(mutation?.type).toBe('delete');
	});

	// Las dos condiciones tienen que darse: el prefijo de path solo no alcanza, y el de la migración solo
	// alcanzaría también a las publicadas.
	it('no borra una colección migrada publicada ni un borrador ajeno', () => {
		expect(migrateDocument({ _id: 'collection-from-storylist-abc' })).toEqual([]);
		expect(migrateDocument({ _id: 'drafts.coleccion-escrita-a-mano' })).toEqual([]);
	});
});
