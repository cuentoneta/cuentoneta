import { describe, expect, it } from 'vitest';

import migration from './index';

// La migración se define con `defineMigration`, que conserva el objeto tal cual: `migrate.document`
// es la función pura que decide el patch de cada documento, y es lo único que hace falta ejercitar.
type MigratedDocument = Parameters<NonNullable<NonNullable<typeof migration.migrate>['document']>>[0];

const migrateDocument = (doc: { _id: string; shortDescription?: unknown; description?: unknown }) => {
	const document = migration.migrate?.document;
	if (!document) throw new Error('La migración no define migrate.document');
	return document(doc as MigratedDocument);
};

describe('copy-short-description-to-description', () => {
	it('alcanza a los dos tipos que renombran el campo', () => {
		expect(migration.documentTypes).toEqual(['resourceType', 'tag']);
	});

	it('copia la descripción al nombre nuevo', () => {
		const patches = migrateDocument({ _id: 'tag-1', shortDescription: 'Relato breve de ficción.' });

		expect(patches).toMatchObject([{ path: ['description'], op: { value: 'Relato breve de ficción.' } }]);
	});

	// Idempotencia: permite reintentar la migración si una corrida se cortó a mitad de camino.
	it('no vuelve a tocar un documento ya copiado', () => {
		const doc = { _id: 'tag-1', shortDescription: 'Relato breve.', description: 'Relato breve.' };

		expect(migrateDocument(doc)).toEqual([]);
	});

	// Una corrida tardía, con el schema nuevo ya desplegado, no debe pisar lo que alguien editó.
	it('respeta una descripción que divergió del valor viejo', () => {
		const doc = { _id: 'tag-1', shortDescription: 'Relato breve.', description: 'Relato breve de ficción.' };

		expect(migrateDocument(doc)).toEqual([]);
	});

	// El estado en que queda el documento tras la fase 2: sin campo viejo y con el nuevo poblado.
	it('no toca un documento que ya perdió el campo viejo', () => {
		expect(migrateDocument({ _id: 'tag-1', description: 'Ya migrada.' })).toEqual([]);
	});

	it('completa una descripción presente pero en blanco', () => {
		const doc = { _id: 'tag-1', shortDescription: 'Relato breve.', description: '   ' };

		expect(migrateDocument(doc)).toMatchObject([{ path: ['description'], op: { value: 'Relato breve.' } }]);
	});

	// El campo lo exige el editor del Studio, no la API: un documento creado por API puede llegar sin
	// ninguna de las dos formas, y ese hueco no lo señala ninguna superficie aguas abajo.
	it('aborta ante un documento sin descripción bajo ninguno de los dos nombres', () => {
		expect(() => migrateDocument({ _id: 'tag-1' })).toThrow(/ninguno de los dos nombres/);
	});

	it('aborta cuando las dos formas del campo están en blanco', () => {
		expect(() => migrateDocument({ _id: 'tag-1', shortDescription: '   ', description: '' })).toThrow(
			/ninguno de los dos nombres/,
		);
	});
});
