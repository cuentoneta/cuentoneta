/**
 * Fortalece en un dataset destino las referencias que el import dejó débiles y que el export de origen
 * declara fuertes. Lo corre el sync de datasets después de cada import, y sirve para recuperarse a mano:
 *
 *   SANITY_STUDIO_DATASET=<destino> pnpm exec sanity exec \
 *     scripts/strengthen-weak-references/strengthen-weak-references.ts --with-user-token \
 *     -- --source=<data.ndjson del export> [--apply] [--summary=<archivo>]
 *
 * Sin `--apply` solo reporta. El detalle, con ids de documentos y errores de la API, va solo a la
 * salida estándar; `--summary` agrega los conteos al archivo indicado. Sale con 0 si el destino quedó como el origen y con 1 si quedan
 * referencias débiles o faltan documentos o assets; qué falló lo dice el reporte.
 */
import { appendFile } from 'node:fs/promises';
import { setTimeout as sleep } from 'node:timers/promises';
import { getCliClient } from 'sanity/cli';

import { assertNotProductionDataset, exitCodeFor, formatReport, formatSummary, parseArgs, runStrengthen } from './run';
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

const formatOptions = { apply: options.apply, dataset };
process.stdout.write(`${formatReport(report, formatOptions).join('\n')}\n`);
if (options.summary) {
	await appendFile(options.summary, ['```', ...formatSummary(report, formatOptions), '```', ''].join('\n'));
}
process.exitCode = exitCodeFor(report);
