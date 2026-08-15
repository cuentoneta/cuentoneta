import { describe, expect, it } from 'vitest';

import migration from './index';

// La migración se define con `defineMigration`, que conserva el objeto tal cual: `migrate.document`
// es la función pura que decide el patch de cada documento, y es lo único que hace falta ejercitar.
type MigratedDocument = Parameters<NonNullable<NonNullable<typeof migration.migrate>['document']>>[0];

interface TestDocument {
	_id: string;
	_type: string;
	slug?: { current?: string };
	resources?: { _key: string; url?: string | null; title?: string }[];
}

const migrateDocument = (doc: TestDocument) => {
	const document = migration.migrate?.document;
	if (!document) throw new Error('La migración no define migrate.document');
	return document(doc as MigratedDocument);
};

const completeResource = { _key: 'sano', url: 'https://es.wikipedia.org/wiki/Julio_Cort%C3%A1zar' };

describe('sanitize-resources-without-url', () => {
	it('recorre los tres tipos que embeben recursos', () => {
		expect(migration.documentTypes).toEqual(['author', 'story', 'literaryWork']);
	});

	it('completa la URL del recurso de un autor con artículo', () => {
		const patches = migrateDocument({
			_id: 'author-1',
			_type: 'author',
			slug: { current: 'neil-gaiman' },
			resources: [{ _key: 'roto' }],
		});

		expect(patches).toMatchObject([
			{ path: ['resources', { _key: 'roto' }, 'url'], op: { value: 'https://es.wikipedia.org/wiki/Neil_Gaiman' } },
		]);
	});

	it('borra el recurso del autor que no tiene artículo al que apuntar', () => {
		const patches = migrateDocument({
			_id: 'author-2',
			_type: 'author',
			slug: { current: 'anonimo' },
			resources: [{ _key: 'roto' }],
		});

		expect(patches).toMatchObject([{ path: ['resources', { _key: 'roto' }], op: { type: 'unset' } }]);
	});

	// El campo llega `null` en las obras y ausente en los autores; ambas formas son el mismo hueco.
	it('trata una url nula igual que una ausente', () => {
		const patches = migrateDocument({
			_id: 'story-1',
			_type: 'story',
			slug: { current: 'wakefield' },
			resources: [{ _key: 'roto', url: null }],
		});

		expect(patches).toMatchObject([{ path: ['resources', { _key: 'roto' }], op: { type: 'unset' } }]);
	});

	it('borra el recurso incompleto de una obra literaria, sin consultar tabla alguna', () => {
		const patches = migrateDocument({
			_id: 'lw-from-story-1',
			_type: 'literaryWork',
			slug: { current: 'una-obra-cualquiera' },
			resources: [{ _key: 'roto', url: null }],
		});

		expect(patches).toMatchObject([{ path: ['resources', { _key: 'roto' }], op: { type: 'unset' } }]);
	});

	it('no toca los recursos sanos del mismo documento', () => {
		const patches = migrateDocument({
			_id: 'author-1',
			_type: 'author',
			slug: { current: 'neil-gaiman' },
			resources: [completeResource, { _key: 'roto' }],
		});

		expect(patches).toHaveLength(1);
		expect(patches).toMatchObject([{ path: ['resources', { _key: 'roto' }, 'url'] }]);
	});

	// Idempotencia: una segunda corrida no encuentra nada que sanear.
	it('no produce mutación sobre un documento ya saneado', () => {
		expect(
			migrateDocument({
				_id: 'author-1',
				_type: 'author',
				slug: { current: 'neil-gaiman' },
				resources: [completeResource],
			}),
		).toEqual([]);
	});

	it('no produce mutación sobre un documento sin recursos', () => {
		expect(migrateDocument({ _id: 'author-3', _type: 'author', slug: { current: 'julio-cortazar' } })).toEqual([]);
	});

	// El guard vive dentro de migrate.document, no solo en el filter: el filtro acota el recorrido,
	// no garantiza la disposición.
	it('aborta ante un autor con un recurso sin URL que no figura en la tabla', () => {
		expect(() =>
			migrateDocument({
				_id: 'author-9',
				_type: 'author',
				slug: { current: 'autor-que-se-sumo-despues' },
				resources: [{ _key: 'roto' }],
			}),
		).toThrow(/no figura en la tabla de disposición/);
	});

	it('aborta ante un autor sin slug', () => {
		expect(() => migrateDocument({ _id: 'author-10', _type: 'author', resources: [{ _key: 'roto' }] })).toThrow(
			/no figura en la tabla de disposición/,
		);
	});
});
