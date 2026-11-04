/**
 * Fortalece en un dataset destino las referencias que el import dejó débiles y que el export de origen
 * declara fuertes. Lo corre el sync de datasets después de cada import, y sirve para recuperarse a mano:
 *
 *   SANITY_STUDIO_DATASET=<destino> pnpm exec sanity exec \
 *     scripts/strengthen-weak-references/strengthen-weak-references.ts --with-user-token \
 *     -- --source=<data.ndjson del export> [--apply]
 *
 * Sin `--apply` solo reporta. Sale con 0 si el destino quedó como el origen y con 1 si quedan
 * referencias débiles o faltan documentos o assets; qué falló lo dice el reporte.
 */
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { setTimeout as sleep } from 'node:timers/promises';
import { getCliClient } from 'sanity/cli';

import type { SanityDocument } from './references';
import {
	assertNotProductionDataset,
	exitCodeFor,
	formatReport,
	parseArgs,
	runStrengthen,
	type DestinationReader,
	type ReferenceWriter,
} from './run';

type SanityClient = ReturnType<typeof getCliClient>;

async function readNdjson(path: string): Promise<SanityDocument[]> {
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

function readerFor(client: SanityClient): DestinationReader {
	return { fetchDocuments: (ids) => client.fetch<SanityDocument[]>('*[_id in $ids]', { ids: [...ids] }) };
}

function writerFor(client: SanityClient): ReferenceWriter {
	return {
		commitUnsets: async (batch) => {
			const transaction = batch.reduce(
				(pending, patch) => pending.patch(patch.id, (p) => p.ifRevisionId(patch.rev).unset([...patch.paths])),
				client.transaction(),
			);
			// `sync` para que la detección de la pasada siguiente ya lea lo escrito.
			await transaction.commit({ visibility: 'sync', tag: 'sync-datasets.strengthen-references' });
		},
	};
}

const options = parseArgs(process.argv.slice(2));
const cliClient = getCliClient({ apiVersion: '2025-02-19' });
const dataset = assertNotProductionDataset(cliClient.config().dataset);
const client = cliClient.withConfig({ useCdn: false, perspective: 'raw' });

const report = await runStrengthen({
	sourceDocuments: await readNdjson(options.source),
	reader: readerFor(client),
	writer: writerFor(client),
	apply: options.apply,
	clock: { sleep: (milliseconds) => sleep(milliseconds), now: () => Date.now() },
});

process.stdout.write(`${formatReport(report, { apply: options.apply, dataset }).join('\n')}\n`);
process.exitCode = exitCodeFor(report);
