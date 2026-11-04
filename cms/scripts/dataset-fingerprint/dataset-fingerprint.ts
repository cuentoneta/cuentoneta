/**
 * Huella de contenido de un export y de un dataset, para verificar que el sync dejó cada destino como
 * espejo exacto del export que tomó al comenzar. Solo lee.
 *
 *   pnpm exec sanity exec scripts/dataset-fingerprint/dataset-fingerprint.ts \
 *     -- --source=<data.ndjson del export>
 *
 * imprime solo la huella del export. Con `--compare=<huella>` y `SANITY_STUDIO_DATASET=<destino>`
 * (más `--with-user-token`), calcula además la del destino: sale con 0 si las tres coinciden —la
 * pasada, la del export y la del destino— y con 1 si no, listando los documentos que difieren.
 */
import { readFile } from 'node:fs/promises';
import { getCliClient } from 'sanity/cli';

import {
	datasetHash,
	differingIds,
	hashDocuments,
	readAllDocuments,
	type SanityDocument,
} from './fingerprint';

function parseArgs(argv: readonly string[]) {
	const values = new Map(argv.map((arg) => arg.split(/=(.*)/s).slice(0, 2) as [string, string]));
	const source = values.get('--source');
	const unknown = [...values.keys()].filter((flag) => flag !== '--source' && flag !== '--compare');
	if (!source || unknown.length > 0) {
		throw new Error('Uso: --source=<data.ndjson> [--compare=<huella del export>]');
	}
	return { source, expected: values.get('--compare') };
}

async function readNdjson(path: string): Promise<SanityDocument[]> {
	const lines = (await readFile(path, 'utf8')).split('\n').filter((line) => line.trim() !== '');
	if (lines.length === 0) {
		throw new Error(`El export de origen está vacío: ${path}`);
	}
	return lines.map((line) => JSON.parse(line) as SanityDocument);
}

function readDestination() {
	const client = getCliClient({ apiVersion: '2025-02-19' }).withConfig({ useCdn: false, perspective: 'raw' });
	// Los documentos de asset no van al ndjson del export y el import los recrea con metadatos propios:
	// lo que dice que un asset es el mismo es el id con sha1 que cada documento referencia.
	const query = `*[!(_type in ["sanity.imageAsset", "sanity.fileAsset"]) && _id > $after] | order(_id) [0...200]`;
	return {
		dataset: client.config().dataset,
		read: () => readAllDocuments((after) => client.fetch<SanityDocument[]>(query, { after })),
	};
}

const { source, expected } = parseArgs(process.argv.slice(2));
const sourceHashes = hashDocuments(await readNdjson(source));
const sourceFingerprint = datasetHash(sourceHashes);

if (expected === undefined) {
	process.stdout.write(`${sourceFingerprint}\n`);
} else {
	const destination = readDestination();
	const destinationHashes = hashDocuments(await destination.read());
	const differing = differingIds(sourceHashes, destinationHashes);
	const matches = sourceFingerprint === expected && differing.length === 0;
	// El log de un repo público es visible para cualquiera y estos ids salen de production, que es
	// privado: alcanzan unos pocos para diagnosticar, el resto se cuenta.
	const listed = 20;
	const rest = differing.length > listed ? [`  … y ${differing.length - listed} más`] : [];
	process.stdout.write(
		[
			`Huella esperada: ${expected}`,
			`Huella del export: ${sourceFingerprint}`,
			`Huella de ${destination.dataset}: ${datasetHash(destinationHashes)}`,
			`Documentos que difieren: ${differing.length}`,
			...differing.slice(0, listed).map((id) => `  · ${id}`),
			...rest,
			'',
		].join('\n'),
	);
	process.exitCode = matches ? 0 : 1;
}
