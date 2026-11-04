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
import { setTimeout as sleep } from 'node:timers/promises';
import { getCliClient } from 'sanity/cli';

import { assertNotProductionDataset, exitCodeFor, formatReport, parseArgs, runStrengthen } from './run';
import { readerFor, readNdjson, writerFor } from './sanity-io';

// TypeScript no infiere el tipo de patch a través de las sobrecargas de `transaction().patch`.
type SanityPatch = ReturnType<ReturnType<typeof getCliClient>['patch']>;

const options = parseArgs(process.argv.slice(2));
const cliClient = getCliClient({ apiVersion: '2025-02-19' });
const dataset = assertNotProductionDataset(cliClient.config().dataset);
const client = cliClient.withConfig({ useCdn: false, perspective: 'raw' });

const report = await runStrengthen({
	sourceDocuments: await readNdjson(options.source),
	reader: readerFor(client),
	writer: writerFor<SanityPatch>(client),
	apply: options.apply,
	clock: { sleep: (milliseconds) => sleep(milliseconds), now: () => Date.now() },
});

process.stdout.write(`${formatReport(report, { apply: options.apply, dataset }).join('\n')}\n`);
process.exitCode = exitCodeFor(report);
