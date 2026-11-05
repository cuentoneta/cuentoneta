/**
 * Importa un export de Sanity en un dataset, como `sanity dataset import`, pero con las mutaciones a
 * un ritmo que respeta el límite por IP de Sanity. El import del CLI fortalece las referencias con una
 * ráfaga que lo supera y no espera lo suficiente ante el 429; su concurrencia no es configurable,
 * pero el cliente que recibe sí.
 *
 *   SANITY_STUDIO_DATASET=<destino> pnpm exec sanity exec scripts/import-dataset/import-dataset.ts \
 *     --with-user-token -- --source=<export .tar.gz>
 *
 * El destino tiene que existir y estar vacío. Nunca escribe en production.
 */
import { createReadStream } from 'node:fs';
import { dirname } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { sanityImport } from '@sanity/import';
import { getCliClient } from 'sanity/cli';

import { createPace, paceMutations } from './pace-mutations';
import { assertTargetDataset } from './target-dataset';

const source = process.argv
	.slice(2)
	.find((arg) => arg.startsWith('--source='))
	?.slice('--source='.length);
if (!source) {
	throw new Error('Uso: --source=<export .tar.gz>');
}

const client = getCliClient({ apiVersion: '2025-02-19' });
const { dataset: configuredDataset, projectId } = client.config();
const dataset = assertTargetDataset(configuredDataset);

// Muy por debajo del límite de mutaciones por segundo que Sanity aplica por IP.
const pace = createPace('100ms', { now: () => Date.now(), sleep: (milliseconds) => sleep(milliseconds) });
let currentStep = '';

const { numDocs } = await sanityImport(createReadStream(source), {
	client: paceMutations(client, pace),
	operation: 'create',
	releasesOperation: 'fail',
	tag: 'sanity.import',
	targetDataset: dataset,
	targetProjectId: projectId,
	assetsBase: dirname(source),
	onProgress: ({ step }) => {
		if (step !== currentStep) {
			currentStep = step;
			process.stdout.write(`${new Date().toISOString()} ${step}\n`);
		}
	},
});

process.stdout.write(`Importados ${numDocs} documentos en "${dataset}".\n`);
