import { describe, expect, it } from 'vitest';

import migration from './index';

// La migración se define con `defineMigration`, que conserva el objeto tal cual: `migrate.document`
// es la función pura que decide el patch de cada documento, y es lo único que hace falta ejercitar.
const migrateDocument = (doc: { _id: string; shortDescription?: unknown; description?: unknown }) => {
	const document = migration.migrate?.document;
	if (!document) throw new Error('La migración no define migrate.document');
	return document(doc as never);
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

	it('no toca un documento sin el campo viejo', () => {
		expect(migrateDocument({ _id: 'tag-1', description: 'Ya migrada.' })).toEqual([]);
	});

	// El campo es requerido: copiar whitespace deja el documento inválido en cuanto el código nuevo lo lee.
	it('aborta en vez de copiar una descripción en blanco', () => {
		expect(() => migrateDocument({ _id: 'tag-1', shortDescription: '   ' })).toThrow(/en blanco/);
	});
});
