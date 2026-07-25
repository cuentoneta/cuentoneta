/**
 * Backfill de reading time para LiteraryWork. Recorre progresivamente (cursor por `_id`) las obras
 * publicadas a las que les falta el `readingTime` de alguna sección o el `totalReadingTime`, computa
 * los valores con el `countWords` real del dominio y los persiste de forma idempotente (`setIfMissing`).
 * Es el complemento proactivo/batch del self-healing on-read (que llega en un increment aparte).
 *
 * Uso:
 *   pnpm backfill-reading-time            # dry-run: reporta qué llenaría, sin escribir
 *   pnpm backfill-reading-time --apply    # persiste (o BACKFILL_APPLY=true, para cron no-interactivo)
 *
 * El dataset objetivo lo fija SANITY_STUDIO_DATASET (el cliente compartido lo levanta del entorno) y
 * se loguea al arrancar. Requiere un token de escritura por entorno (SANITY_STUDIO_TOKEN); nunca
 * hardcodear. Precondición de runtime: los campos deben estar desplegados en el schema del dataset
 * objetivo (ver .claude/references/scripts.md).
 */
/* eslint-disable no-console */
import { client } from '../src/api/_helpers/sanity-connector';
import { isEmptyPlan, planBackfill, type BackfillPlan, type RawWorkForBackfill } from './backfill-reading-time.helpers';

const APPLY = process.argv.includes('--apply') || process.env.BACKFILL_APPLY === 'true';
const PAGE_SIZE = parsePageSize(process.env.BACKFILL_PAGE_SIZE);

// Candidatas: obras publicadas (no drafts) con `_id` mayor al cursor a las que falta el total o
// alguna sección sin `readingTime`. `order(_id)` + `_id > $lastId` da un recorrido estable ante
// escrituras concurrentes (a diferencia del slice por offset).
const candidatePageQuery = `
*[_type == 'literaryWork' && !(_id in path('drafts.**')) && _id > $lastId
  && (!defined(totalReadingTime) || count(content[!defined(readingTime)]) > 0)]
  | order(_id) [0...$pageSize] {
    _id, totalReadingTime, 'content': content[]{ _key, body, readingTime }
  }`;

interface Totals {
	scanned: number;
	filled: number;
	sections: number;
	totals: number;
	errors: number;
}

function parsePageSize(raw: string | undefined): number {
	const parsed = Number(raw);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : 50;
}

function fetchCandidatePage(lastId: string): Promise<RawWorkForBackfill[]> {
	return client.fetch<RawWorkForBackfill[]>(candidatePageQuery, { lastId, pageSize: PAGE_SIZE });
}

function buildSetValues(plan: BackfillPlan): Record<string, number> {
	const values: Record<string, number> = {};
	if (plan.totalReadingTime !== undefined) {
		values.totalReadingTime = plan.totalReadingTime;
	}
	for (const section of plan.sectionReadingTimes) {
		values[`content[_key=="${section.key}"].readingTime`] = section.readingTime;
	}
	return values;
}

async function processWork(work: RawWorkForBackfill, totals: Totals): Promise<void> {
	const plan = planBackfill(work);
	if (isEmptyPlan(plan)) {
		return;
	}
	totals.filled += 1;
	totals.sections += plan.sectionReadingTimes.length;
	totals.totals += plan.totalReadingTime === undefined ? 0 : 1;
	if (APPLY) {
		await client.patch(work._id).setIfMissing(buildSetValues(plan)).commit({ visibility: 'async' });
	}
}

async function processPage(page: readonly RawWorkForBackfill[], totals: Totals): Promise<string> {
	let lastId = '';
	for (const work of page) {
		totals.scanned += 1;
		lastId = work._id;
		try {
			await processWork(work, totals);
		} catch (error) {
			totals.errors += 1;
			console.error(`Error en la obra ${work._id}:`, new Error('backfill de reading time falló', { cause: error }));
		}
	}
	return lastId;
}

async function run(): Promise<Totals> {
	const totals: Totals = { scanned: 0, filled: 0, sections: 0, totals: 0, errors: 0 };
	let lastId = '';
	for (;;) {
		const page = await fetchCandidatePage(lastId);
		if (page.length === 0) {
			break;
		}
		lastId = await processPage(page, totals);
	}
	return totals;
}

async function main(): Promise<void> {
	const dataset = client.config().dataset ?? 'desconocido';
	console.log(
		`Backfill de reading time — dataset "${dataset}" — ${APPLY ? 'APPLY (escribe)' : 'DRY-RUN (no escribe)'}`,
	);
	const totals = await run();
	console.log(
		`Listo. Escaneadas: ${totals.scanned} · A completar: ${totals.filled} ` +
			`(secciones: ${totals.sections}, totales: ${totals.totals}) · Errores: ${totals.errors}`,
	);
	if (!APPLY && totals.filled > 0) {
		console.log('Dry-run: nada se escribió. Corré con --apply para persistir.');
	}
	if (totals.errors > 0) {
		process.exitCode = 1;
	}
}

main().catch((error) => {
	console.error('Backfill falló:', error);
	process.exitCode = 1;
});
