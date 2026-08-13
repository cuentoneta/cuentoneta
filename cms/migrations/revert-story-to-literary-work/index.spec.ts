import { describe, expect, it } from 'vitest';

import { literaryWorkIdFor } from '../story-to-literary-work/build-literary-work-document';
import migration from './index';

const migrateDocument = (doc: { _id: string }) => {
	const document = migration.migrate?.document;
	if (!document) throw new Error('La migración no define migrate.document');
	return document(doc as never);
};

describe('reversión de la creación de obras', () => {
	it('alcanza solo a las obras', () => {
		expect(migration.documentTypes).toEqual(['literaryWork']);
	});

	// `startsWith` y no `match`: el operador `match` de GROQ compara por tokens, así que un `"prefijo-*"`
	// es más ancho de lo que aparenta y deja pasar ids que no arrancan con el prefijo.
	// Dos ramas porque el prefijo de path de un borrador antecede al de la migración: una obra en
	// borrador arranca con `drafts.`, no con el prefijo propio.
	it('acota el recorrido a los ids que arrancan con el prefijo derivado', () => {
		expect(migration.filter).toBe(
			'string::startsWith(_id, "lw-from-story-") || string::startsWith(_id, "drafts.lw-from-story-")',
		);
	});

	it('borra la obra que nació de un cuento', () => {
		const mutations = migrateDocument({ _id: literaryWorkIdFor('story-1') }) as { type: string; id: string }[];

		expect(mutations).toHaveLength(1);
		expect(mutations[0]?.type).toBe('delete');
		expect(mutations[0]?.id).toBe('lw-from-story-story-1');
	});

	// Un cuento con versión publicada y borrador tiene dos obras: la baja debe alcanzar la que se le
	// pasa, no arrastrar la otra.
	it('borra la obra en borrador sin tocar la publicada', () => {
		const mutations = migrateDocument({ _id: literaryWorkIdFor('drafts.story-1') }) as { type: string; id: string }[];

		expect(mutations).toHaveLength(1);
		expect(mutations[0]?.type).toBe('delete');
		expect(mutations[0]?.id).toBe('drafts.lw-from-story-story-1');
	});

	// El guard es la garantía, no el filtro: una invocación con otro filtro —o un cambio futuro en el
	// runner— no debe alcanzar para borrar una obra que esta migración no creó.
	it('no toca una obra nacida en el Studio, aunque el filtro la deje pasar', () => {
		expect(migrateDocument({ _id: 'una-obra-del-studio' })).toEqual([]);
		expect(migrateDocument({ _id: 'drafts.una-obra-del-studio' })).toEqual([]);
	});

	it('no se deja engañar por un id que solo contiene el prefijo', () => {
		expect(migrateDocument({ _id: 'obra-lw-from-story-suelta' })).toEqual([]);
		expect(migrateDocument({ _id: 'drafts.obra-lw-from-story-suelta' })).toEqual([]);
	});

	// El predicado se comparte con la migración de ida: si cada una tuviera el suyo, una divergencia
	// entre ambas definiciones podría dejar obras sin borrar o borrar de más.
	it('reconoce exactamente lo que la migración de ida crea', () => {
		expect(migrateDocument({ _id: literaryWorkIdFor('cualquier-story') })).toHaveLength(1);
		expect(migrateDocument({ _id: literaryWorkIdFor('drafts.cualquier-story') })).toHaveLength(1);
	});
});
