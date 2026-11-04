import { describe, expect, it } from 'vitest';

import {
	buildSourceIndex,
	diffAgainstDestination,
	isImportedDocument,
	serializePath,
	type SanityDocument,
	type SourceEntry,
} from './references';

const reference = (id: string) => ({ _type: 'reference', _ref: id });
const weakened = (id: string) => ({ ...reference(id), _weak: true });

// Una obra con referencias a tres profundidades: en la raíz, en un array y en un array dentro de un objeto.
const exportedWork: SanityDocument = {
	_id: 'work-1',
	_type: 'literaryWork',
	publication: reference('publication-1'),
	authors: [{ _key: 'a1', ...reference('author-1') }],
	content: { tags: [reference('tag-1')] },
	coverImage: { _type: 'image', _sanityAsset: 'image@file://./images/cover.jpg' },
};

// La misma obra después del import: referencias debilitadas y el asset ya enlazado.
const importedWork: SanityDocument = {
	_id: 'work-1',
	_rev: 'rev-1',
	_type: 'literaryWork',
	publication: weakened('publication-1'),
	authors: [{ _key: 'a1', ...weakened('author-1') }],
	content: { tags: [weakened('tag-1')] },
	coverImage: { _type: 'image', asset: reference('image-cover') },
};

function sourceOf(doc: SanityDocument): SourceEntry {
	const entry = buildSourceIndex([doc]).get(doc._id);
	if (!entry) {
		throw new Error(`${doc._id} no quedó indexado`);
	}
	return entry;
}

describe('serializePath', () => {
	it('joins keys with dots and writes array indexes in brackets', () => {
		expect(serializePath(['content', 'tags', 0, '_ref'])).toBe('content.tags[0]._ref');
	});

	it('quotes keys that are numeric strings', () => {
		expect(serializePath(['translations', '2', 'author'])).toBe('translations["2"].author');
	});

	it('starts with the index when the path starts in an array', () => {
		expect(serializePath([0, 'author'])).toBe('[0].author');
	});
});

describe('isImportedDocument', () => {
	it('keeps content documents and drafts', () => {
		expect(isImportedDocument({ _id: 'work-1' })).toBe(true);
		expect(isImportedDocument({ _id: 'drafts.work-1' })).toBe(true);
	});

	it('skips system documents except releases and variants', () => {
		expect(isImportedDocument({ _id: '_.groups.editors' })).toBe(false);
		expect(isImportedDocument({ _id: '_.releases.summer' })).toBe(true);
		expect(isImportedDocument({ _id: '_.variants.dark' })).toBe(true);
	});
});

describe('buildSourceIndex', () => {
	it('skips the documents the import does not write', () => {
		const index = buildSourceIndex([exportedWork, { _id: '_.groups.editors' }]);

		expect([...index.keys()]).toEqual(['work-1']);
	});

	it('records every strong reference, at any depth', () => {
		expect([...sourceOf(exportedWork).strongPaths]).toEqual(['publication', 'authors[0]', 'content.tags[0]']);
	});

	it('leaves out the references that are weak in the source', () => {
		const withIntendedWeakReference = { ...exportedWork, publication: weakened('publication-1') };

		expect(sourceOf(withIntendedWeakReference).strongPaths.has('publication')).toBe(false);
	});

	it('records where the source exports an asset', () => {
		expect(sourceOf(exportedWork).assetPaths).toEqual(['coverImage']);
	});
});

describe('diffAgainstDestination', () => {
	it('asks to unset the weak flag of every reference that is strong in the source', () => {
		expect(diffAgainstDestination(sourceOf(exportedWork), importedWork)).toEqual({
			kind: 'present',
			rev: 'rev-1',
			unsetPaths: ['publication._weak', 'authors[0]._weak', 'content.tags[0]._weak'],
			unresolvedAssets: [],
		});
	});

	it('asks for nothing once the references are strong', () => {
		const strengthened = {
			...importedWork,
			publication: reference('publication-1'),
			authors: [{ _key: 'a1', ...reference('author-1') }],
			content: { tags: [reference('tag-1')] },
		};

		const diff = diffAgainstDestination(sourceOf(exportedWork), strengthened);

		expect(diff).toMatchObject({ kind: 'present', unsetPaths: [] });
	});

	it('keeps weak the references that are weak in the source', () => {
		const source = sourceOf({ ...exportedWork, publication: weakened('publication-1') });

		const diff = diffAgainstDestination(source, importedWork);

		expect(diff).toMatchObject({ unsetPaths: ['authors[0]._weak', 'content.tags[0]._weak'] });
	});

	it('refuses a destination document without a revision', () => {
		const withoutRevision = { ...importedWork, _rev: undefined };

		expect(() => diffAgainstDestination(sourceOf(exportedWork), withoutRevision)).toThrow('work-1');
	});

	it('reports a document the destination does not have', () => {
		expect(diffAgainstDestination(sourceOf(exportedWork), undefined)).toEqual({ kind: 'missing' });
	});

	it('reports an asset slot the import left without an asset', () => {
		const withoutAsset = { ...importedWork, coverImage: { _type: 'image' } };

		const diff = diffAgainstDestination(sourceOf(exportedWork), withoutAsset);

		expect(diff).toMatchObject({ unresolvedAssets: ['coverImage'] });
	});
});
