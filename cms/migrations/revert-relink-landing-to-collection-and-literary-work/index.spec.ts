import { describe, expect, it } from 'vitest';

import migration from './index';

const migrateDocument = (doc: Record<string, unknown>) => {
	const document = migration.migrate?.document;
	if (!document) throw new Error('La migración no define migrate.document');
	return document(doc as never) as { path: string[]; op: { type: string } }[];
};

const reference = (ref: string) => ({ _key: 'k1', _type: 'reference' as const, _ref: ref });

const relinkedLandingPage = (overrides: Record<string, unknown> = {}) => ({
	_id: 'landing-2026-01',
	_type: 'landingPage' as const,
	cards: [reference('storylist-verano')],
	latestReads: [reference('story-el-aleph')],
	collections: [reference('collection-from-storylist-storylist-verano')],
	latestLiteraryWorks: [reference('lw-from-story-story-el-aleph')],
	...overrides,
});

describe('reversión del reapuntado', () => {
	it('da de baja los dos campos nuevos de la página de inicio', () => {
		const patches = migrateDocument(relinkedLandingPage());

		expect(patches.map(({ path, op }) => [path[0], op.type])).toEqual([
			['collections', 'unset'],
			['latestLiteraryWorks', 'unset'],
		]);
	});

	it('da de baja las obras más leídas del contenido rotativo', () => {
		const patches = migrateDocument({
			_id: 'rotating-content',
			_type: 'rotatingContent',
			mostRead: [reference('story-el-aleph')],
			mostReadLiteraryWorks: [reference('lw-from-story-story-el-aleph')],
		});

		expect(patches.map(({ path }) => path[0])).toEqual(['mostReadLiteraryWorks']);
	});

	it('no produce mutación sobre un documento que nunca se reapuntó', () => {
		expect(migrateDocument(relinkedLandingPage({ collections: undefined, latestLiteraryWorks: undefined }))).toEqual(
			[],
		);
	});

	// Sin la fuente, el campo nuevo pasó a ser la única copia de esas referencias: darlo de baja las
	// destruiría, y la reversión dejó de ser una reversión.
	it('aborta si el campo de origen ya no está poblado', () => {
		expect(() => migrateDocument(relinkedLandingPage({ cards: [] }))).toThrowError(/collections/);
	});

	it('aborta si el origen de las obras más leídas ya no está', () => {
		expect(() =>
			migrateDocument({
				_id: 'rotating-content',
				_type: 'rotatingContent',
				mostReadLiteraryWorks: [reference('lw-from-story-story-el-aleph')],
			}),
		).toThrowError(/mostReadLiteraryWorks/);
	});

	it('deja fuera los borradores, igual que la migración de ida', () => {
		expect(migration.filter).toBe("!(_id in path('drafts.**'))");
	});
});
