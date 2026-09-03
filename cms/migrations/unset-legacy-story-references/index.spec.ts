import { describe, expect, it } from 'vitest';

import migration from './index';

const migrateDocument = (doc: Record<string, unknown>) => {
	const document = migration.migrate?.document;
	if (!document) throw new Error('La migración no define migrate.document');
	return document(doc as never);
};

// Se afirma también el tipo de operación: un `path` correcto con la operación equivocada dejaría el
// campo en pie, que es justamente lo que bloquea la purga.
const unsetPaths = (mutations: unknown) =>
	(mutations as { path: string[]; op: { type: string } }[])
		.filter((mutation) => mutation.op.type === 'unset')
		.map((mutation) => mutation.path.join('.'))
		.sort();

describe('baja de los campos de referencia al contenido retirado', () => {
	it('alcanza a la página de inicio y al contenido rotativo', () => {
		expect(migration.documentTypes).toEqual(['landingPage', 'rotatingContent']);
	});

	it('da de baja los dos campos de la página de inicio', () => {
		const mutations = migrateDocument({
			_id: 'landing-1974-24',
			_type: 'landingPage',
			cards: [{ _ref: 'storylist-1' }],
			latestReads: [{ _ref: 'story-1' }],
		});

		expect(unsetPaths(mutations)).toEqual(['cards', 'latestReads']);
	});

	it('da de baja el campo del contenido rotativo', () => {
		const mutations = migrateDocument({
			_id: 'rotatingContent',
			_type: 'rotatingContent',
			mostRead: [{ _ref: 'story-1' }],
		});

		expect(unsetPaths(mutations)).toEqual(['mostRead']);
	});

	// La tabla es por tipo: un campo que no pertenece al documento no se toca aunque esté presente,
	// porque su baja pertenece a otra entrada de la tabla y no a ésta.
	it('no cruza los campos de un tipo con los del otro', () => {
		const landing = migrateDocument({
			_id: 'landing-1974-24',
			_type: 'landingPage',
			cards: [],
			mostRead: [{ _ref: 'story-1' }],
		});
		const rotating = migrateDocument({
			_id: 'rotatingContent',
			_type: 'rotatingContent',
			mostRead: [],
			latestReads: [{ _ref: 'story-1' }],
		});

		expect(unsetPaths(landing)).toEqual(['cards']);
		expect(unsetPaths(rotating)).toEqual(['mostRead']);
	});

	// El campo se da de baja por estar presente, no por traer referencias: una landing que lo dejó
	// vacío igual lo declara, y dejarlo sería dejar el schema viejo asomando en el documento.
	it('da de baja el campo presente aunque no traiga referencias', () => {
		const mutations = migrateDocument({ _id: 'landing-1974-24', _type: 'landingPage', cards: [] });

		expect(unsetPaths(mutations)).toEqual(['cards']);
	});

	it('no produce mutación sobre un documento que ya no los declara', () => {
		expect(migrateDocument({ _id: 'landing-1975-01', _type: 'landingPage', collections: [] })).toEqual([]);
		expect(migrateDocument({ _id: 'rotatingContent', _type: 'rotatingContent' })).toEqual([]);
	});

	// El guard es la garantía, no `documentTypes`: una invocación con otro alcance —o un cambio futuro
	// en el runner— no debe alcanzar para tocar un documento que esta migración no gobierna.
	it('no toca un tipo ajeno, aunque traiga un campo homónimo', () => {
		expect(migrateDocument({ _id: 'obra-1', _type: 'literaryWork', latestReads: [{ _ref: 'x' }] })).toEqual([]);
	});
});
