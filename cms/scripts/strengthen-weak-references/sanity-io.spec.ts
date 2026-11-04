import { describe, expect, it } from 'vitest';

import { writerFor, type MutationClient } from './sanity-io';

interface RecordedPatch {
	id: string;
	ifRevisionId?: string;
	unset?: string[];
}

// Registra la transacción que arma el adaptador, con la forma encadenable del cliente de Sanity.
class SpySanityClient implements MutationClient<PatchSpy> {
	public readonly transactions: { patches: RecordedPatch[]; commitOptions?: unknown }[] = [];

	public transaction() {
		const recorded: { patches: RecordedPatch[]; commitOptions?: unknown } = { patches: [] };
		this.transactions.push(recorded);
		const transaction = {
			patch: (id: string, build: (patch: PatchSpy) => PatchSpy) => {
				const patch = new PatchSpy(id);
				recorded.patches.push(build(patch).recorded);
				return transaction;
			},
			commit: async (options: unknown) => {
				recorded.commitOptions = options;
			},
		};
		return transaction;
	}
}

class PatchSpy {
	public readonly recorded: RecordedPatch;

	constructor(id: string) {
		this.recorded = { id };
	}

	public ifRevisionId(rev: string) {
		this.recorded.ifRevisionId = rev;
		return this;
	}

	public unset(paths: string[]) {
		this.recorded.unset = paths;
		return this;
	}
}

describe('writerFor', () => {
	it('writes the whole batch as one transaction, each unset guarded by the revision it read', async () => {
		const client = new SpySanityClient();

		await writerFor(client).commitUnsets([
			{ id: 'work-0', rev: 'rev-a', paths: ['publication._weak'] },
			{ id: 'work-1', rev: 'rev-b', paths: ['authors[0]._weak', 'content.tags[0]._weak'] },
		]);

		expect(client.transactions).toEqual([
			{
				patches: [
					{ id: 'work-0', ifRevisionId: 'rev-a', unset: ['publication._weak'] },
					{ id: 'work-1', ifRevisionId: 'rev-b', unset: ['authors[0]._weak', 'content.tags[0]._weak'] },
				],
				commitOptions: { visibility: 'sync', tag: 'sync-datasets.strengthen-references' },
			},
		]);
	});
});
