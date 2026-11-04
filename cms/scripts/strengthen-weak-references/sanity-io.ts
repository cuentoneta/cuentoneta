import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createInterface } from 'node:readline';

import type { SanityDocument } from './references';
import type { DestinationReader, ReferenceWriter } from './run';

// La porción del cliente de Sanity que usan los adaptadores, declarada acá para poder sustituirla en
// los tests sin depender de @sanity/client, que cms/ no declara como dependencia directa.
interface PatchBuilder<P> {
	ifRevisionId(rev: string): P;
	unset(paths: string[]): P;
}

interface TransactionBuilder<P extends PatchBuilder<P>> {
	patch(id: string, build: (patch: P) => P): TransactionBuilder<P>;
	commit(options: { visibility: 'sync'; tag: string }): Promise<unknown>;
}

export interface QueryClient {
	fetch<R>(query: string, params: { ids: string[] }): Promise<R>;
}

export interface MutationClient<P extends PatchBuilder<P>> {
	transaction(): TransactionBuilder<P>;
}

/** Lee los documentos de un `data.ndjson`; lanza si el archivo no existe o está vacío. */
export async function readNdjson(path: string): Promise<SanityDocument[]> {
	if ((await stat(path)).size === 0) {
		throw new Error(`El export de origen está vacío: ${path}`);
	}
	const docs: SanityDocument[] = [];
	for await (const line of createInterface({ input: createReadStream(path), crlfDelay: Infinity })) {
		if (line.trim() !== '') {
			docs.push(JSON.parse(line) as SanityDocument);
		}
	}
	return docs;
}

export function readerFor(client: QueryClient): DestinationReader {
	return { fetchDocuments: (ids) => client.fetch<SanityDocument[]>('*[_id in $ids]', { ids: [...ids] }) };
}

/**
 * Escribe cada lote como una transacción: un `unset` por documento, condicionado a la revisión que se
 * leyó. Se confirma con visibilidad `sync` para que la detección de la pasada siguiente ya lea lo escrito.
 */
export function writerFor<P extends PatchBuilder<P>>(client: MutationClient<P>): ReferenceWriter {
	return {
		commitUnsets: async (batch) => {
			const transaction = batch.reduce(
				(pending, patch) => pending.patch(patch.id, (p) => p.ifRevisionId(patch.rev).unset([...patch.paths])),
				client.transaction(),
			);
			await transaction.commit({ visibility: 'sync', tag: 'sync-datasets.strengthen-references' });
		},
	};
}
