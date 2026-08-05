import { describe, expect, it } from 'vitest';

import migration from './index';

// La migración se define con `defineMigration`, que conserva el objeto tal cual: `migrate.document`
// es la función pura que decide el patch de cada documento, y es lo único que hace falta ejercitar.
const migrateDocument = (doc: { _id: string; shortDescription?: unknown; description?: unknown }) => {
	const document = migration.migrate?.document;
	if (!document) throw new Error('La migración no define migrate.document');
	return document(doc as never);
};

describe('unset-legacy-short-description', () => {
	it('alcanza a los dos tipos que renombran el campo', () => {
		expect(migration.documentTypes).toEqual(['resourceType', 'tag']);
	});

	it('da de baja el campo viejo cuando la descripción ya vive bajo el nombre nuevo', () => {
		const patches = migrateDocument({ _id: 'tag-1', shortDescription: 'Relato breve.', description: 'Relato breve.' });

		expect(patches).toMatchObject([{ path: ['shortDescription'], op: { type: 'unset' } }]);
	});

	// Idempotencia: permite reintentar la migración si una corrida se cortó a mitad de camino.
	it('no toca un documento que ya perdió el campo viejo', () => {
		expect(migrateDocument({ _id: 'tag-1', description: 'Relato breve.' })).toEqual([]);
	});

	// El interlock es lo que vuelve segura una corrida fuera de orden: sin él, borraría la única copia.
	it('aborta cuando la descripción todavía no está bajo el nombre nuevo', () => {
		expect(() => migrateDocument({ _id: 'tag-1', shortDescription: 'Relato breve.' })).toThrow(/nombre nuevo/);
	});

	it('aborta cuando la descripción del nombre nuevo está en blanco', () => {
		const doc = { _id: 'tag-1', shortDescription: 'Relato breve.', description: '   ' };

		expect(() => migrateDocument(doc)).toThrow(/nombre nuevo/);
	});
});
