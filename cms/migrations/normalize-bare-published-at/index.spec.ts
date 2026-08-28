import { describe, expect, it } from 'vitest';

import migration from './index';

// La migración se define con `defineMigration`, que conserva el objeto tal cual: `migrate.document`
// es la función pura que decide el patch de cada documento, y es lo único que hace falta ejercitar.
type MigratedDocument = Parameters<NonNullable<NonNullable<typeof migration.migrate>['document']>>[0];

interface TestDocument {
	_id: string;
	_type: string;
	publishedAt?: string | null;
}

const migrateDocument = (doc: TestDocument) => {
	const document = migration.migrate?.document;
	if (!document) throw new Error('La migración no define migrate.document');
	return document(doc as MigratedDocument);
};

describe('normalize-bare-published-at', () => {
	it('recorre los dos tipos que declaran la fecha de publicación', () => {
		expect(migration.documentTypes).toEqual(['literaryWork', 'story']);
	});

	it.each(['literaryWork', 'story'])('completa la fecha desnuda de un documento %s', (_type) => {
		const patches = migrateDocument({ _id: 'obra', _type, publishedAt: '2022-01-23' });

		expect(patches).toEqual([{ path: ['publishedAt'], op: { type: 'set', value: '2022-01-23T03:00:00.000Z' } }]);
	});

	// Una segunda corrida no debe producir mutación: es lo que permite re-aplicarla sin pensar.
	it('no toca una fecha que ya trae hora', () => {
		expect(migrateDocument({ _id: 'obra', _type: 'literaryWork', publishedAt: '2022-02-01T01:18:27Z' })).toEqual([]);
	});

	it.each([undefined, null])('no completa nada cuando el campo vale %p', (publishedAt) => {
		expect(migrateDocument({ _id: 'obra', _type: 'literaryWork', publishedAt })).toEqual([]);
	});

	// Una forma que no es ni la sana ni la que se corrige no tiene disposición: la corrida se detiene
	// nombrando el documento, en vez de escribirle un instante arbitrario.
	// La forma no alcanza: una fecha que el calendario no tiene produciría un instante que el value
	// object acepta y el reloj no resuelve — un error ruidoso cambiado por una corrupción callada.
	it.each(['2022-1-3', '23/01/2022', '', '2022-13-45', '2022-02-30'])(
		'aborta ante la forma desconocida %p',
		(publishedAt) => {
			expect(() => migrateDocument({ _id: 'obra-rara', _type: 'literaryWork', publishedAt })).toThrow('obra-rara');
		},
	);

	it('aborta cuando el valor no es texto', () => {
		const noEsTexto = { _id: 'obra-rara', _type: 'literaryWork', publishedAt: 20220123 } as unknown as TestDocument;

		expect(() => migrateDocument(noEsTexto)).toThrow('obra-rara');
	});
});
