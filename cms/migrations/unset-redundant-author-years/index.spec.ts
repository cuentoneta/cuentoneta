import { describe, expect, it } from 'vitest';

import migration from './index';

const migrateDocument = (doc: Record<string, unknown>) => {
	const document = migration.migrate?.document;
	if (!document) throw new Error('La migración no define migrate.document');
	return document(doc as never) as { path: string[]; op: { type: string } }[];
};

const author = (fields: Record<string, unknown>) => ({ _id: 'author-1', _type: 'author', ...fields });

const unsetOf = (...paths: string[]) =>
	paths.map((path) => expect.objectContaining({ path: [path], op: expect.objectContaining({ type: 'unset' }) }));

describe('unset-redundant-author-years', () => {
	it('unsets the persisted year when the full date derives it', () => {
		expect(migrateDocument(author({ bornOn: '1948-01-01', bornOnYear: 1948 }))).toEqual(unsetOf('bornOnYear'));
	});

	it('unsets it even when it diverges from the date, because the date is the source of truth', () => {
		expect(migrateDocument(author({ diedOn: '1994-12-31', diedOnYear: 1990 }))).toEqual(unsetOf('diedOnYear'));
	});

	it('handles both fields of the same author', () => {
		const doc = author({ bornOn: '-0043-03-20', bornOnYear: -43, diedOn: '1994-12-31', diedOnYear: 1994 });

		expect(migrateDocument(doc)).toEqual(unsetOf('bornOnYear', 'diedOnYear'));
	});

	it('unsets a null year the plugin left on an author without date', () => {
		expect(migrateDocument(author({ bornOnYear: null, diedOnYear: null }))).toEqual(
			unsetOf('bornOnYear', 'diedOnYear'),
		);
	});

	it('keeps the manual year of an author without date', () => {
		expect(migrateDocument(author({ bornOnYear: 1500 }))).toEqual([]);
	});

	it('keeps the manual year when the date cannot be read, since the API falls back to it', () => {
		expect(migrateDocument(author({ bornOn: '1948-1-1', bornOnYear: 1950 }))).toEqual([]);
		expect(migrateDocument(author({ bornOn: '2101-01-01', bornOnYear: 2101 }))).toEqual([]);
	});

	it('leaves alone an author that never had a persisted year', () => {
		expect(migrateDocument(author({ bornOn: '1948-01-01' }))).toEqual([]);
		expect(migrateDocument(author({}))).toEqual([]);
	});

	it('is idempotent: a second pass over the migrated document emits nothing', () => {
		const migrated = author({ bornOn: '1948-01-01', diedOn: '1994-12-31' });

		expect(migrateDocument(migrated)).toEqual([]);
	});
});
