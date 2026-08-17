import { describe, expect, it } from 'vitest';

import migration from './index';

// La migración se define con `defineMigration`, que conserva el objeto tal cual: `migrate.document`
// es la función pura que decide el patch de cada documento. Acá no depende del documento —el mismo
// patch vale para todos— así que no recibe ninguno.
const migrateDocument = () => {
	const document = migration.migrate?.document;
	if (!document) throw new Error('La migración no define migrate.document');
	return document();
};

describe('set-default-bad-language', () => {
	it('alcanza a los dos tipos que declaran el campo', () => {
		expect(migration.documentTypes).toEqual(['story', 'literaryWork']);
	});

	it('completa el valor ausente con false', () => {
		expect(migrateDocument()).toMatchObject([{ path: ['badLanguage'], op: { value: false } }]);
	});

	// Quién decide es el servidor, no la migración: por eso emite el mismo patch para todo documento y
	// lo que hay que afirmar acá es la operación elegida. Un `set` pisaría una declaración hecha a mano.
	it('emite setIfMissing y no set, para no pisar lo ya declarado', () => {
		const [patch] = migrateDocument();

		expect(patch).toMatchObject({ path: ['badLanguage'], op: { type: 'setIfMissing' } });
	});
});
