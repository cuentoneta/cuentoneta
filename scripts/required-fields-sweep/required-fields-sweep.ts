/**
 * Barrido de campos requeridos que el dato persistido no cumple. Deriva del schema versionado qué
 * atributos se declaran obligatorios y cuenta, contra Sanity, cuántos documentos los incumplen.
 *
 * `Rule.required()` gobierna la edición en el Studio, no el almacenamiento: un documento anterior a
 * la regla, o escrito por script o migración, la esquiva sin dejar señal, y el typegen igual emite un
 * tipo no-nullable en el que el mapper confía.
 *
 * **Read-only sobre el contenido, siempre.** Solo `--apply` escribe, y lo único que escribe es un
 * issue de seguimiento con título fijo: nunca toca un documento ni cierra nada.
 *
 * Corre programado y **no** como gate. Lo que verifica es una propiedad del **dato**, que cambia sin
 * que nadie toque el repositorio, y consultarla exige red: atarla a un PR haría fallar diffs que no
 * la tocaron. Los checks del repo siguen siendo offline y deterministas.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

import { client } from '../../src/api/_helpers/sanity-connector';
import { environment } from '../../src/api/_helpers/environment';
import { buildFieldCountQueries } from './required-fields-sweep.groq';
import {
	breachesOf,
	decideAction,
	formatConsoleReport,
	type FieldBreach,
	type SweepReport,
} from './required-fields-sweep.report';
import { scanRequiredFields } from './required-fields-sweep.schema';

const TRACKING_TITLE = 'Campos requeridos que el dato persistido no cumple';
const SCHEMA_PATH = new URL('../../cms/schema.json', import.meta.url);

// Sin CDN: el barrido tiene que ver el estado real, no una copia que puede tener minutos de atraso.
const sanityClient = client.withConfig({ useCdn: false });

function gh(...args: string[]): string {
	return execFileSync('gh', args, { encoding: 'utf8' });
}

/**
 * Un dataset que no se puede leer **no falla**: sin permiso, una consulta de conteo devuelve `0` en
 * vez de un error. Sin este guard, una credencial vencida produciría un reporte impecable de "ningún
 * campo incumplido" y, con `--apply`, anunciaría que ya no queda nada que atender. Es exactamente el
 * modo de falla que este barrido existe para cerrar.
 */
async function assertDatasetIsReadable(): Promise<void> {
	const total: number = await sanityClient.fetch('count(*)');
	if (total === 0) {
		throw new Error(
			`el dataset "${environment.sanity.dataset}" no devolvió ningún documento: la credencial no alcanza para leerlo, o apunta a un dataset vacío`,
		);
	}
}

async function countBreaches(): Promise<{ report: SweepReport }> {
	const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf8'));
	const { required, uncovered } = scanRequiredFields(schema);
	const queries = buildFieldCountQueries(required);

	const counts: FieldBreach[] = [];
	for (const { label, publishedQuery, draftsQuery } of queries) {
		const [published, drafts] = await Promise.all([
			sanityClient.fetch(publishedQuery),
			sanityClient.fetch(draftsQuery),
		]);
		counts.push({ label, published, drafts });
	}

	return { report: { breaches: breachesOf(counts), uncovered, scannedFields: queries.length } };
}

function findTrackingIssue(): { number: number; body: string } | null {
	const raw = gh(
		'issue',
		'list',
		'--state',
		'open',
		'--search',
		`"${TRACKING_TITLE}" in:title`,
		'--json',
		'number,title,body',
	);
	const found = (JSON.parse(raw) as { number: number; title: string; body: string }[]).find(
		(issue) => issue.title === TRACKING_TITLE,
	);
	return found ? { number: found.number, body: found.body ?? '' } : null;
}

function applyAction(report: SweepReport): void {
	const existing = findTrackingIssue();
	const action = decideAction({ report, existing });

	if (action.kind === 'create') {
		gh('issue', 'create', '--title', TRACKING_TITLE, '--body', action.body, '--label', '🛠️ tooling');
		process.stdout.write('seguimiento creado.\n');
		return;
	}
	if (action.kind === 'noop') {
		process.stdout.write('sin cambios respecto de la corrida anterior.\n');
		return;
	}

	// Las dos ramas restantes editan el seguimiento, así que sin él no hay nada que editar: `gh` recibe
	// el literal "undefined" como número y falla con un mensaje que no dice qué pasó.
	if (!existing) {
		throw new Error(`se decidió "${action.kind}" sin un issue de seguimiento que editar`);
	}

	gh('issue', 'edit', String(existing.number), '--body', action.body);
	if (action.kind === 'resolved') {
		gh('issue', 'comment', String(existing.number), '--body', action.comment);
		process.stdout.write(`comentado en #${existing.number}; se cierra a mano.\n`);
		return;
	}
	process.stdout.write(`seguimiento #${existing.number} actualizado.\n`);
}

process.stdout.write(
	`Barrido de campos requeridos — proyecto ${environment.sanity.projectId}, dataset ${environment.sanity.dataset}\n`,
);

await assertDatasetIsReadable();
const { report } = await countBreaches();

process.stdout.write(`${formatConsoleReport(report)}\n`);

if (process.argv.includes('--apply')) {
	applyAction(report);
}
