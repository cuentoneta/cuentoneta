import { describe, expect, it } from 'vitest';

import { literaryWorkIdFor } from '../story-to-literary-work/build-literary-work-document';
import migration from './index';

const migrateDocument = (doc: { _id: string }) => {
	const document = migration.migrate?.document;
	if (!document) throw new Error('La migración no define migrate.document');
	return document(doc as never);
};

describe('reversión acotada a las obras en borrador', () => {
	it('alcanza solo a las obras', () => {
		expect(migration.documentTypes).toEqual(['literaryWork']);
	});

	it('acota el recorrido a los ids de obra en borrador', () => {
		expect(migration.filter).toBe('string::startsWith(_id, "drafts.lw-from-story-")');
	});

	it('borra la obra que nació de un cuento en borrador', () => {
		const mutations = migrateDocument({ _id: literaryWorkIdFor('drafts.story-1') }) as { type: string; id: string }[];

		expect(mutations).toHaveLength(1);
		expect(mutations[0]?.type).toBe('delete');
		expect(mutations[0]?.id).toBe('drafts.lw-from-story-story-1');
	});

	// La razón de ser de esta migración: la reversión amplia se lleva las dos formas a la vez.
	it('no toca una obra publicada, aunque haya nacido de la misma migración', () => {
		expect(migrateDocument({ _id: literaryWorkIdFor('story-1') })).toEqual([]);
	});

	// El guard es la garantía, no el filtro: estar bajo `drafts.` no convierte un documento en una obra
	// migrada.
	it('no toca un borrador nacido en el Studio', () => {
		expect(migrateDocument({ _id: 'drafts.una-obra-del-studio' })).toEqual([]);
	});

	it('no se deja engañar por un id que solo contiene el prefijo', () => {
		expect(migrateDocument({ _id: 'drafts.obra-lw-from-story-suelta' })).toEqual([]);
	});
});
