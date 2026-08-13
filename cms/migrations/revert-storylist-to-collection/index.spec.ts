import { evaluate, parse } from 'groq-js';
import { describe, expect, it } from 'vitest';

import migration from './index';

const migrateDocument = (doc: { _id: string }) => {
	const document = migration.migrate?.document;
	if (!document) throw new Error('La migración no define migrate.document');
	return document(doc as never);
};

describe('reversión amplia de colecciones migradas', () => {
	it('alcanza solo a las colecciones', () => {
		expect(migration.documentTypes).toEqual(['collection']);
	});

	describe('el filtro decide qué entra', () => {
		const matching = async (...docs: Record<string, unknown>[]) => {
			const result = await evaluate(parse(`*[${migration.filter}]._id`), { dataset: docs });
			return (await result.get()) as string[];
		};

		it('alcanza las dos formas del identificador derivado', async () => {
			const publicada = { _id: 'collection-from-storylist-abc', _type: 'collection' };
			const borrador = { _id: 'drafts.collection-from-storylist-abc', _type: 'collection' };

			expect(await matching(publicada, borrador)).toEqual([publicada._id, borrador._id]);
		});

		it('deja fuera una colección ajena a la migración', async () => {
			const aMano = { _id: 'coleccion-escrita-a-mano', _type: 'collection' };
			const borradorAMano = { _id: 'drafts.coleccion-escrita-a-mano', _type: 'collection' };

			expect(await matching(aMano, borradorAMano)).toEqual([]);
		});
	});

	it('borra la colección migrada, publicada o en borrador', () => {
		const publicada = migrateDocument({ _id: 'collection-from-storylist-abc' }) as { type: string; id: string }[];
		const borrador = migrateDocument({ _id: 'drafts.collection-from-storylist-abc' }) as {
			type: string;
			id: string;
		}[];

		expect(publicada[0]?.type).toBe('delete');
		expect(borrador[0]?.type).toBe('delete');
	});

	// El guard revalida porque el filtro es una optimización del runner, no la garantía: es lo que
	// protege una colección creada a mano en el Studio.
	it('no emite mutación ante una colección ajena a la migración', () => {
		expect(migrateDocument({ _id: 'coleccion-escrita-a-mano' })).toEqual([]);
	});
});
