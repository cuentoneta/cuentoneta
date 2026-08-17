import { describe, expect, it } from 'vitest';

import migration from './index';

// La migración se define con `defineMigration`, que conserva el objeto tal cual: `migrate.document`
// es la función pura que decide el patch de cada documento, y es lo único que hace falta ejercitar.
type MigratedDocument = Parameters<NonNullable<NonNullable<typeof migration.migrate>['document']>>[0];

const migrateDocument = (doc: { _id: string; badLanguage?: boolean }) => {
	const document = migration.migrate?.document;
	if (!document) throw new Error('La migración no define migrate.document');
	return document(doc as MigratedDocument);
};

describe('set-default-bad-language', () => {
	it('alcanza a los dos tipos que declaran el campo', () => {
		expect(migration.documentTypes).toEqual(['story', 'literaryWork']);
	});

	it('completa el valor ausente con false', () => {
		expect(migrateDocument({ _id: 'story-1' })).toMatchObject([{ path: ['badLanguage'], op: { value: false } }]);
	});

	// `setIfMissing` decide del lado del servidor, así que la migración emite el mismo patch para todos
	// y lo que se afirma acá es la operación elegida: `set` pisaría una declaración hecha a mano.
	it('emite setIfMissing y no set, para no pisar lo ya declarado', () => {
		const [patch] = migrateDocument({ _id: 'story-2', badLanguage: true });

		expect(patch).toMatchObject({ path: ['badLanguage'], op: { type: 'setIfMissing' } });
	});
});
