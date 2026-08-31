import { describe, expect, it } from 'vitest';

import migration from './index';

const migrateDocument = (doc: { _id: string; _type: string }) => {
	const document = migration.migrate?.document;
	if (!document) throw new Error('La migración no define migrate.document');
	return document(doc as never);
};

const deletedIds = (mutations: unknown) =>
	(mutations as { type: string; id: string }[]).filter((mutation) => mutation.type === 'delete').map(({ id }) => id);

describe('purga de los cuentos retirados', () => {
	it('alcanza solo a los cuentos', () => {
		expect(migration.documentTypes).toEqual(['story']);
	});

	it('emite la baja del documento publicado, y nada más', () => {
		const mutations = migrateDocument({ _id: 'story-1', _type: 'story' });

		expect(mutations).toHaveLength(1);
		expect(deletedIds(mutations)).toEqual(['story-1']);
	});

	// `del` borra la versión que recibe: la publicada y su borrador se dan de baja cada una por su
	// cuenta, y borrar una no debe arrastrar a la otra.
	it('borra el borrador sin arrastrar la versión publicada', () => {
		expect(deletedIds(migrateDocument({ _id: 'drafts.story-1', _type: 'story' }))).toEqual(['drafts.story-1']);
	});

	// El guard es la garantía y `documentTypes` la optimización: una invocación con otro alcance no
	// debe alcanzar para borrar otra cosa. Es lo único que separa esta migración de una purga masiva.
	it('no borra un documento de otro tipo', () => {
		expect(migrateDocument({ _id: 'obra-1', _type: 'literaryWork' })).toEqual([]);
		expect(migrateDocument({ _id: 'drafts.obra-1', _type: 'collection' })).toEqual([]);
	});

	// La idempotencia no vive en `migrate.document` sino en el recorrido: una segunda corrida no
	// encuentra documentos de este tipo. Lo que sí se afirma acá es que la mutación es exactamente una
	// baja por `_id`, sin parches que pudieran reescribir algo antes de borrarlo.
	it('no emite ninguna otra mutación además de la baja', () => {
		const mutations = migrateDocument({ _id: 'story-1', _type: 'story' }) as { type: string }[];

		expect(mutations.map(({ type }) => type)).toEqual(['delete']);
	});
});
