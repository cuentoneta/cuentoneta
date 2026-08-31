/**
 * Barrido de campos cuyo valor persistido no tiene la forma que su schema declara. Cuenta, contra
 * Sanity, cuántos documentos guardan cada campo vigilado con una forma que el dominio rechaza.
 *
 * El tipo declarado gobierna la edición en el Studio, no el almacenamiento: un documento escrito por
 * script o migración guarda la forma que le hayan puesto, y el typegen deriva del tipo declarado, así
 * que el mapper recibe un valor que su value object rechaza y la lectura del documento falla entera.
 *
 * **Read-only sobre el contenido, siempre.** Solo `--apply` escribe, y lo único que escribe es un
 * issue de seguimiento con título fijo: nunca toca un documento ni cierra nada.
 *
 * Corre programado y **no** como gate. Lo que verifica es una propiedad del **dato**, que cambia sin
 * que nadie toque el repositorio, y consultarla exige red: atarla a un PR haría fallar diffs que no
 * la tocaron.
 */
import { client } from '../../src/api/_helpers/sanity-connector';
import { environment } from '../../src/api/_helpers/environment';
import { WATCHED_FIELDS } from './field-shape-sweep.fields';
import { buildShapeCountQueries } from './field-shape-sweep.groq';
import {
	breachesOf,
	decideAction,
	formatConsoleReport,
	type ShapeBreach,
	type SweepReport,
} from './field-shape-sweep.report';
import { findTrackingIssue, gh } from '../tracking-issue';

const TRACKING_TITLE = 'Campos cuya forma persistida no coincide con la que el schema declara';

// Sin CDN: el barrido tiene que ver el estado real, no una copia que puede tener minutos de atraso.
const sanityClient = client.withConfig({ useCdn: false });

/**
 * Un dataset que no se puede leer **no falla**: sin permiso, una consulta de conteo devuelve `0` en
 * vez de un error. Sin este guard, una credencial vencida produciría un reporte impecable de "ninguna
 * forma incumplida" y, con `--apply`, anunciaría que ya no queda nada que atender.
 */
async function assertDatasetIsReadable(): Promise<void> {
	const total: number = await sanityClient.fetch('count(*)');
	if (total === 0) {
		throw new Error(
			`el dataset "${environment.sanity.dataset}" no devolvió ningún documento: la credencial no alcanza para leerlo, o apunta a un dataset vacío`,
		);
	}
}

async function countBreaches(): Promise<SweepReport> {
	const queries = buildShapeCountQueries(WATCHED_FIELDS);

	const counts: ShapeBreach[] = [];
	for (const { label, publishedQuery, draftsQuery } of queries) {
		const [published, drafts] = await Promise.all([
			sanityClient.fetch(publishedQuery),
			sanityClient.fetch(draftsQuery),
		]);
		counts.push({ label, published, drafts });
	}

	return { breaches: breachesOf(counts), scannedFields: queries.length };
}

function applyAction(report: SweepReport): void {
	const existing = findTrackingIssue(TRACKING_TITLE);
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
	`Barrido de forma de campo — proyecto ${environment.sanity.projectId}, dataset ${environment.sanity.dataset}\n`,
);

await assertDatasetIsReadable();
const report = await countBreaches();

process.stdout.write(`${formatConsoleReport(report)}\n`);

if (process.argv.includes('--apply')) {
	applyAction(report);
}
