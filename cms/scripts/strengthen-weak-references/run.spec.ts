import { describe, expect, it } from 'vitest';

import type { SanityDocument } from './references';
import { toMilliseconds, type Clock } from './retry';
import {
	assertNotProductionDataset,
	exitCodeFor,
	formatReport,
	formatSummary,
	parseArgs,
	runStrengthen,
	type DestinationReader,
	type ReferenceWriter,
	type UnsetPatch,
} from './run';

type JsonObject = Record<string, unknown>;

class SpySleeper implements Clock {
	public readonly sleeps: number[] = [];

	public async sleep(milliseconds: number): Promise<void> {
		this.sleeps.push(milliseconds);
	}

	public now(): number {
		return 0;
	}
}

function httpError(statusCode: number, headers: Record<string, string> = {}) {
	return Object.assign(new Error(`HTTP ${statusCode}`), { statusCode, response: { statusCode, headers } });
}

// Parte un path serializado (`content.tags[0]._weak`) en sus segmentos.
function parsePath(path: string): (string | number)[] {
	return [...path.matchAll(/\[(\d+)\]|\["([^"]+)"\]|([^.[\]]+)/g)].map(([, index, quoted, key]) =>
		index === undefined ? (quoted ?? key) : Number(index),
	);
}

function unsetPath(doc: JsonObject, path: string) {
	const segments = parsePath(path);
	const leaf = segments.pop();
	const parent = segments.reduce<unknown>((node, segment) => (node as JsonObject)[segment], doc) as JsonObject;
	delete parent[leaf as string];
}

// Dataset en memoria que se comporta como Content Lake ante un `ifRevisionId`: rechaza con 409 el
// patch de un documento que cambió de revisión, y cada transacción aplicada cambia la revisión.
class InMemoryDataset implements DestinationReader, ReferenceWriter {
	public readonly transactions: (readonly UnsetPatch[])[] = [];
	private readonly docs: Map<string, JsonObject>;
	private revision = 0;

	constructor(docs: readonly SanityDocument[]) {
		this.docs = new Map(docs.map((doc) => [doc._id, structuredClone(doc) as JsonObject]));
	}

	public async fetchDocuments(ids: readonly string[]): Promise<SanityDocument[]> {
		return ids.flatMap((id) => {
			const doc = this.docs.get(id);
			return doc ? [structuredClone(doc) as SanityDocument] : [];
		});
	}

	public async commitUnsets(batch: readonly UnsetPatch[]): Promise<void> {
		if (batch.some((patch) => this.docs.get(patch.id)?.['_rev'] !== patch.rev)) {
			throw httpError(409);
		}
		this.transactions.push(batch);
		for (const patch of batch) {
			const doc = this.docs.get(patch.id) as JsonObject;
			patch.paths.forEach((path) => unsetPath(doc, path));
			doc['_rev'] = `rev-${++this.revision}`;
		}
	}

	public document(id: string): JsonObject | undefined {
		return this.docs.get(id);
	}

	public touch(id: string) {
		(this.docs.get(id) as JsonObject)['_rev'] = 'edited-meanwhile';
	}
}

// Rechaza con 429 las primeras transacciones, como hace Sanity cuando una ráfaga supera su límite.
class ControllableRateLimitedWriter implements ReferenceWriter {
	constructor(
		private readonly dataset: InMemoryDataset,
		private rejectionsLeft: number,
		private readonly retryAfter = '2',
	) {}

	public async commitUnsets(batch: readonly UnsetPatch[]): Promise<void> {
		if (this.rejectionsLeft > 0) {
			this.rejectionsLeft--;
			throw httpError(429, { 'retry-after': this.retryAfter });
		}
		return this.dataset.commitUnsets(batch);
	}
}

const reference = (id: string) => ({ _type: 'reference', _ref: id });

function exportedWork(index: number): SanityDocument {
	return {
		_id: `work-${index}`,
		_type: 'literaryWork',
		authors: [{ _key: 'a1', ...reference(`author-${index}`) }],
		publication: reference('publication-1'),
	};
}

// Lo que deja el import: cada referencia debilitada y una revisión.
function asImported(doc: SanityDocument): SanityDocument {
	const json = JSON.stringify(doc, (key, value: unknown) =>
		typeof value === 'object' && value !== null && '_ref' in value ? { ...value, _weak: true } : value,
	);
	return { ...(JSON.parse(json) as SanityDocument), _rev: `initial-${doc._id}` };
}

function corpusOf(size: number) {
	const source = Array.from({ length: size }, (_, index) => exportedWork(index));
	return { source, destination: new InMemoryDataset(source.map(asImported)) };
}

describe('runStrengthen', () => {
	it('strengthens every weak reference and leaves nothing pending', async () => {
		const { source, destination } = corpusOf(3);

		const report = await runStrengthen({
			sourceDocuments: source,
			reader: destination,
			writer: destination,
			apply: true,
			clock: new SpySleeper(),
		});

		expect(report).toMatchObject({ inspected: 3, strengthened: 3, pending: [], failed: [] });
		expect(destination.document('work-1')).toMatchObject({ publication: reference('publication-1') });
		expect(destination.document('work-1')?.['publication']).not.toHaveProperty('_weak');
		expect(exitCodeFor(report)).toBe(0);
	});

	it('keeps weak a reference that is weak in the source', async () => {
		const intendedWeak = { ...exportedWork(0), publication: { ...reference('publication-1'), _weak: true } };
		const destination = new InMemoryDataset([asImported(intendedWeak)]);

		await runStrengthen({
			sourceDocuments: [intendedWeak],
			reader: destination,
			writer: destination,
			apply: true,
			clock: new SpySleeper(),
		});

		expect(destination.document('work-0')?.['publication']).toHaveProperty('_weak', true);
	});

	it('writes batches of at most thirty documents, paced one transaction at a time', async () => {
		const { source, destination } = corpusOf(65);
		const clock = new SpySleeper();

		await runStrengthen({ sourceDocuments: source, reader: destination, writer: destination, apply: true, clock });

		expect(destination.transactions.map((batch) => batch.length)).toEqual([30, 30, 5]);
		expect(clock.sleeps).toEqual([toMilliseconds('200ms'), toMilliseconds('200ms')]);
	});

	it('recovers from a rate limit by waiting what the server asks', async () => {
		const { source, destination } = corpusOf(2);
		const clock = new SpySleeper();

		const report = await runStrengthen({
			sourceDocuments: source,
			reader: destination,
			writer: new ControllableRateLimitedWriter(destination, 2, '4'),
			apply: true,
			clock,
		});

		expect(report.pending).toEqual([]);
		expect(clock.sleeps).toEqual([toMilliseconds('4s'), toMilliseconds('4s')]);
	});

	it('isolates a stale revision and repairs it on the next pass', async () => {
		const { source, destination } = corpusOf(3);
		const reader: DestinationReader = {
			fetchDocuments: async (ids) => {
				const docs = await destination.fetchDocuments(ids);
				destination.touch('work-1');
				return docs;
			},
		};

		const report = await runStrengthen({
			sourceDocuments: source,
			reader,
			writer: destination,
			apply: true,
			clock: new SpySleeper(),
		});

		expect(destination.transactions[0]).toHaveLength(1);
		expect(report).toMatchObject({ strengthened: 3, pending: [], failed: [] });
	});

	it('reports the documents that keep failing and exits with an error', async () => {
		const { source, destination } = corpusOf(2);
		const alwaysConflicting: ReferenceWriter = {
			commitUnsets: async () => {
				throw httpError(409);
			},
		};

		const report = await runStrengthen({
			sourceDocuments: source,
			reader: destination,
			writer: alwaysConflicting,
			apply: true,
			clock: new SpySleeper(),
		});

		expect(report.failed.map((failure) => failure.id)).toEqual(['work-0', 'work-1']);
		expect(report.pending).toHaveLength(2);
		expect(exitCodeFor(report)).toBe(1);
	});

	it('stops instead of splitting a batch when the destination keeps failing transiently', async () => {
		const { source, destination } = corpusOf(2);
		const batches: number[] = [];
		const unavailable: ReferenceWriter = {
			commitUnsets: async (batch) => {
				batches.push(batch.length);
				throw httpError(503);
			},
		};

		const report = await runStrengthen({
			sourceDocuments: source,
			reader: destination,
			writer: unavailable,
			apply: true,
			clock: new SpySleeper(),
		});

		expect(batches).toEqual([2, 2, 2, 2, 2, 2]);
		expect(report.failed.map((failure) => failure.id)).toEqual(['work-0', 'work-1']);
		expect(exitCodeFor(report)).toBe(1);
	});

	it('only detects in dry run', async () => {
		const { source, destination } = corpusOf(2);

		const report = await runStrengthen({
			sourceDocuments: source,
			reader: destination,
			writer: destination,
			apply: false,
			clock: new SpySleeper(),
		});

		expect(destination.transactions).toEqual([]);
		expect(report.pending.map((patch) => patch.id)).toEqual(['work-0', 'work-1']);
		expect(exitCodeFor(report)).toBe(1);
	});

	it('fails when the destination lacks a document or an asset', async () => {
		const withCover = {
			...exportedWork(0),
			coverImage: { _type: 'image', _sanityAsset: 'image@file://./images/cover.jpg' },
		};
		const destination = new InMemoryDataset([asImported(withCover)]);

		const report = await runStrengthen({
			sourceDocuments: [withCover, exportedWork(1)],
			reader: destination,
			writer: destination,
			apply: true,
			clock: new SpySleeper(),
		});

		expect(report).toMatchObject({ missing: ['work-1'], unresolvedAssets: ['work-0 coverImage'] });
		expect(exitCodeFor(report)).toBe(1);
	});
});

describe('assertNotProductionDataset', () => {
	it('accepts a target dataset', () => {
		expect(assertNotProductionDataset('staging')).toBe('staging');
	});

	it('rejects production and a missing dataset', () => {
		expect(() => assertNotProductionDataset('production')).toThrow('production');
		expect(() => assertNotProductionDataset('')).toThrow();
		expect(() => assertNotProductionDataset(undefined)).toThrow();
	});
});

describe('parseArgs', () => {
	it('reads the source and applies only when asked', () => {
		expect(parseArgs(['--source=data.ndjson'])).toEqual({ source: 'data.ndjson', apply: false });
		expect(parseArgs(['--source=data.ndjson', '--apply'])).toEqual({ source: 'data.ndjson', apply: true });
	});

	it('reads the summary file when given', () => {
		expect(parseArgs(['--source=data.ndjson', '--summary=summary.md'])).toEqual({
			source: 'data.ndjson',
			apply: false,
			summary: 'summary.md',
		});
	});

	it('requires the source and rejects unknown arguments', () => {
		expect(() => parseArgs(['--apply'])).toThrow('--source');
		expect(() => parseArgs(['--source='])).toThrow();
		expect(() => parseArgs(['--source=a', '--force'])).toThrow('--force');
	});
});

describe('formatSummary', () => {
	const report = {
		inspected: 3,
		strengthened: 1,
		missing: ['drafts.work-9'],
		unresolvedAssets: ['work-2 coverImage'],
		pending: [{ id: 'work-1', rev: 'rev-1', paths: ['publication._weak'] }],
		failed: [{ id: 'work-1', reason: 'Document "work-1" has unexpected revision' }],
	};
	const options = { apply: true, dataset: 'staging' };

	it('counts each outcome without naming any document or API error', () => {
		const summary = formatSummary(report, options).join('\n');

		expect(summary).toContain('Documentos con referencias débiles pendientes: 1');
		expect(summary).toContain('Documentos fallidos: 1');
		expect(summary).not.toMatch(/work-\d|unexpected revision/);
	});

	it('leaves the detail to the full report', () => {
		const detail = formatReport(report, options).join('\n');

		expect(detail).toContain('drafts.work-9');
		expect(detail).toContain('work-1: Document "work-1" has unexpected revision');
	});
});
