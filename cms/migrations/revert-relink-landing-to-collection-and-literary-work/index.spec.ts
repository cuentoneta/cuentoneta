import { describe, expect, it } from 'vitest';

import {
	buildCollectionReferences,
	buildLiteraryWorkReferences,
} from '../relink-landing-to-collection-and-literary-work/build-relinked-references';
import migration from './index';

const migrateDocument = (doc: Record<string, unknown>) => {
	const document = migration.migrate?.document;
	if (!document) throw new Error('La migración no define migrate.document');
	return document(doc as never) as { path: string[]; op: { type: string } }[];
};

const reference = (ref: string) => ({ _key: 'k1', _type: 'reference' as const, _ref: ref });

const cards = [reference('storylist-verano')];
const latestReads = [reference('story-el-aleph')];
const mostRead = [reference('story-el-aleph')];

/** Un documento tal como lo dejó la migración de ida: los campos nuevos derivados de los viejos. */
const relinkedLandingPage = (overrides: Record<string, unknown> = {}) => ({
	_id: 'landing-2026-01',
	_type: 'landingPage',
	cards,
	latestReads,
	collections: buildCollectionReferences(cards),
	latestLiteraryWorks: buildLiteraryWorkReferences(latestReads),
	...overrides,
});

const relinkedRotatingContent = (overrides: Record<string, unknown> = {}) => ({
	_id: 'rotating-content',
	_type: 'rotatingContent',
	mostRead,
	mostReadLiteraryWorks: buildLiteraryWorkReferences(mostRead),
	...overrides,
});

describe('reversión del reapuntado', () => {
	it('alcanza a los dos tipos de documento que llevan las referencias', () => {
		expect(migration.documentTypes).toEqual(['landingPage', 'rotatingContent']);
	});

	// Recorre los borradores porque es lo que la ida escribió: dejarlos afuera revertiría a medias.
	it('revierte un borrador igual que un documento publicado', () => {
		const borrador = { ...relinkedLandingPage(), _id: 'drafts.landing-2026-01' };

		expect(migrateDocument(borrador).map(({ path }) => path[0])).toEqual(['collections', 'latestLiteraryWorks']);
	});

	it('da de baja los dos campos nuevos de la página de inicio', () => {
		expect(migrateDocument(relinkedLandingPage()).map(({ path, op }) => [path[0], op.type])).toEqual([
			['collections', 'unset'],
			['latestLiteraryWorks', 'unset'],
		]);
	});

	it('da de baja las obras más leídas del contenido rotativo', () => {
		expect(migrateDocument(relinkedRotatingContent()).map(({ path }) => path[0])).toEqual(['mostReadLiteraryWorks']);
	});

	it('no produce mutación sobre un documento que nunca se reapuntó', () => {
		const sinReapuntar = { _id: 'landing-2026-02', _type: 'landingPage', cards, latestReads };

		expect(migrateDocument(sinReapuntar)).toEqual([]);
	});

	// Sin la fuente, el campo nuevo pasó a ser la única copia de esas referencias: darlo de baja las
	// destruiría, y la reversión dejó de ser una reversión.
	it('aborta si el campo de origen ya no está poblado', () => {
		expect(() => migrateDocument(relinkedLandingPage({ cards: [] }))).toThrowError(/collections/);
	});

	it('aborta si el origen de las obras más leídas ya no está', () => {
		const sinOrigen = {
			_id: 'rotating-content',
			_type: 'rotatingContent',
			mostReadLiteraryWorks: buildLiteraryWorkReferences(mostRead),
		};

		expect(() => migrateDocument(sinOrigen)).toThrowError(/mostReadLiteraryWorks/);
	});

	// La ida elige escritura de backfill justamente para no pisar una edición manual. La vuelta tiene que
	// cuidarla igual, o lo que una respeta la otra lo borra.
	it('aborta si el contenido fue editado después de migrar', () => {
		const editado = relinkedLandingPage({ collections: [reference('collection-elegida-a-mano')] });

		expect(() => migrateDocument(editado)).toThrowError(/editado/);
	});
});
