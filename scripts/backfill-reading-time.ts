/**
 * Backfill del reading time persistido de las obras literarias.
 *
 * Recorre las obras a las que les falta `totalReadingTime` o el `readingTime` de alguna sección, los
 * computa con los helpers de dominio y los persiste con `setIfMissing`: idempotente, no pisa un valor
 * ya cargado. Eso respeta la duración editorial de las obras recitadas o audiovisuales, donde el total
 * lo carga a mano quien edita.
 *
 * Uso:
 *   pnpm backfill:reading-time                 # corrida en seco: reporta qué se llenaría
 *   pnpm backfill:reading-time --no-dry-run    # persiste
 */
import { client } from '../src/api/_helpers/sanity-connector';
import { environment } from '../src/api/_helpers/environment';
import { readingTimeBackfillCandidatesQuery } from '@queries/literary-work.query';
import {
	formatReadingTimeBackfillReport,
	READING_TIME_BACKFILL_PAGE_SIZE,
	runReadingTimeBackfill,
	type LiteraryWorkCandidatePageFetcher,
} from './backfill-reading-time.helpers';

const APPLY = process.argv.includes('--no-dry-run');

// El connector sirve de la CDN en producción: un backfill tiene que leer el estado real, no uno cacheado.
const sanityClient = client.withConfig({ useCdn: false });

const fetcher: LiteraryWorkCandidatePageFetcher = {
	fetchPage: (cursor, pageSize) => sanityClient.fetch(readingTimeBackfillCandidatesQuery, { cursor, pageSize }),
};

async function run(): Promise<void> {
	console.log(
		`Backfill de reading time — proyecto ${environment.sanity.projectId}, dataset ${environment.sanity.dataset}, ` +
			`modo ${APPLY ? 'APLICAR' : 'seco'}`,
	);

	if (APPLY && !environment.sanity.token) {
		console.error('Falta el token de escritura de Sanity (SANITY_STUDIO_TOKEN): no se intenta escribir.');
		process.exitCode = 1;
		return;
	}

	const report = await runReadingTimeBackfill({
		fetcher,
		writer: sanityClient,
		apply: APPLY,
		pageSize: READING_TIME_BACKFILL_PAGE_SIZE,
	});

	console.log(formatReadingTimeBackfillReport(report, { apply: APPLY }).join('\n'));

	if (report.failed.length > 0) {
		process.exitCode = 1;
	}
}

run().catch((error: unknown) => {
	console.error(error);
	process.exitCode = 1;
});
