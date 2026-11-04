import { describe, expect, it } from 'vitest';

import {
	assetIdFromExport,
	datasetHash,
	differingIds,
	documentHash,
	hashDocuments,
	readAllDocuments,
	type SanityDocument,
} from './fingerprint';

// Una obra como la escribe el export: el asset como ruta de archivo y una referencia débil a propósito.
const exported: SanityDocument = {
	_id: 'work-1',
	_rev: 'rev-in-production',
	_updatedAt: '2026-08-17T16:34:20Z',
	_createdAt: '2026-08-05T18:36:53Z',
	_type: 'literaryWork',
	title: 'Casa tomada',
	coverImage: { _type: 'image', _sanityAsset: 'image@file://./images/852a12-229x320.svg' },
	publication: { _type: 'reference', _ref: 'publication-1', _weak: true },
};

// La misma obra después del import: otra revisión y otra fecha de escritura, el asset enlazado por id
// y las claves en otro orden.
const imported: SanityDocument = {
	publication: { _ref: 'publication-1', _type: 'reference', _weak: true },
	coverImage: { asset: { _type: 'reference', _ref: 'image-852a12-229x320-svg' }, _type: 'image' },
	title: 'Casa tomada',
	_type: 'literaryWork',
	_createdAt: '2026-08-05T18:36:53Z',
	_updatedAt: '2026-11-04T15:46:02Z',
	_rev: 'rev-in-development',
	_id: 'work-1',
};

describe('assetIdFromExport', () => {
	it('maps an exported image to its asset id', () => {
		expect(assetIdFromExport('image@file://./images/852a12-229x320.svg')).toBe('image-852a12-229x320-svg');
	});

	it('maps an exported file to its asset id', () => {
		expect(assetIdFromExport('file@file://./files/3e0d43-m4a.bin')).toBe('file-3e0d43-m4a');
	});

	it('maps a file whose extension has no digit, which the export keeps as is', () => {
		expect(assetIdFromExport('file@file://./files/3e0d43.wav')).toBe('file-3e0d43-wav');
	});

	it('rejects a path it does not know', () => {
		expect(() => assetIdFromExport('image@https://example.com/cover.jpg')).toThrow('cover.jpg');
	});
});

describe('documentHash', () => {
	it('matches an exported document with its imported copy', () => {
		expect(documentHash(imported)).toBe(documentHash(exported));
	});

	it('changes when a field changes', () => {
		expect(documentHash({ ...imported, title: 'Casa tomada (edición corregida)' })).not.toBe(
			documentHash(exported),
		);
	});

	it('changes when a reference the source keeps weak arrives strong', () => {
		const strengthened = { ...imported, publication: { _ref: 'publication-1', _type: 'reference' } };

		expect(documentHash(strengthened)).not.toBe(documentHash(exported));
	});

	it('changes when the import links another asset', () => {
		const otherCover = { ...imported, coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-ffff' } } };

		expect(documentHash(otherCover)).not.toBe(documentHash(exported));
	});
});

describe('datasetHash', () => {
	const hashes = hashDocuments([exported, { _id: 'author-1', name: 'Julio Cortázar' }]);

	it('does not depend on the order of the documents', () => {
		const reversed = hashDocuments([{ _id: 'author-1', name: 'Julio Cortázar' }, imported]);

		expect(datasetHash(reversed)).toBe(datasetHash(hashes));
	});

	it('changes when a document is missing or extra', () => {
		expect(datasetHash(hashDocuments([exported]))).not.toBe(datasetHash(hashes));
		expect(datasetHash(hashDocuments([exported, imported, { _id: 'extra' }]))).not.toBe(datasetHash(hashes));
	});

	it('leaves out system documents but keeps releases', () => {
		const withSystem = hashDocuments([exported, { _id: '_.groups.editors' }, { _id: '_.releases.summer' }]);

		expect([...withSystem.keys()]).toEqual(['work-1', '_.releases.summer']);
	});
});

describe('differingIds', () => {
	it('lists the documents that differ, are missing or are extra', () => {
		const expected = new Map([
			['a', '1'],
			['b', '2'],
			['c', '3'],
		]);
		const actual = new Map([
			['a', '1'],
			['b', 'changed'],
			['d', '4'],
		]);

		expect(differingIds(expected, actual)).toEqual(['b', 'c', 'd']);
	});
});

describe('readAllDocuments', () => {
	it('pages by the last id until a page comes back empty', async () => {
		const pages = new Map<string, SanityDocument[]>([
			['', [{ _id: 'a' }, { _id: 'b' }]],
			['b', [{ _id: 'c' }]],
			['c', []],
		]);
		const requested: string[] = [];

		const docs = await readAllDocuments(async (after) => {
			requested.push(after);
			return pages.get(after) ?? [];
		});

		expect(docs.map((doc) => doc._id)).toEqual(['a', 'b', 'c']);
		expect(requested).toEqual(['', 'b', 'c']);
	});
});
