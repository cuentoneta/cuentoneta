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
 * Las dos perspectivas se cuentan por separado: mezclarlas infla el reporte con borradores a medio
 * cargar, que son un estado legítimo del Studio y no un incumplimiento que alguien deba atender.
 */
async function countBreaches(): Promise<{ breaches: FieldBreach[]; scanned: number; report: SweepReport }> {
	const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf8'));
	const { required, uncovered } = scanRequiredFields(schema);
	const queries = buildFieldCountQueries(required);

	const counts: FieldBreach[] = [];
	for (const { label, query } of queries) {
		counts.push({
			label,
			published: await sanityClient.withConfig({ perspective: 'published' }).fetch(query),
			drafts: await sanityClient.withConfig({ perspective: 'drafts' }).fetch(query),
		});
	}

	const breaches = breachesOf(counts);
	return { breaches, scanned: queries.length, report: { breaches, uncovered, scannedFields: queries.length } };
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

	switch (action.kind) {
		case 'create':
			gh('issue', 'create', '--title', TRACKING_TITLE, '--body', action.body, '--label', '🛠️ tooling');
			process.stdout.write('seguimiento creado.\n');
			break;
		case 'update':
			gh('issue', 'edit', String(existing?.number), '--body', action.body);
			process.stdout.write(`seguimiento #${existing?.number} actualizado.\n`);
			break;
		case 'resolved':
			gh('issue', 'edit', String(existing?.number), '--body', action.body);
			gh('issue', 'comment', String(existing?.number), '--body', action.comment);
			process.stdout.write(`comentado en #${existing?.number}; se cierra a mano.\n`);
			break;
		default:
			process.stdout.write('sin cambios respecto de la corrida anterior.\n');
	}
}

const { report } = await countBreaches();

process.stdout.write(
	`Barrido de campos requeridos — proyecto ${environment.sanity.projectId}, dataset ${environment.sanity.dataset}\n`,
);
process.stdout.write(`${formatConsoleReport(report)}\n`);

if (process.argv.includes('--apply')) {
	applyAction(report);
}
