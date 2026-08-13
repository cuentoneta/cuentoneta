/**
 * Sweep de menciones a issues: consulta el estado real de cada issue citado en el repo y reporta los
 * que ya no están abiertos. El criterio y la decisión viven en `issue-refs-sweep.helpers.ts`; acá solo
 * están la lectura del árbol, la consulta a GitHub y la escritura del seguimiento.
 *
 * **Read-only por defecto.** Solo `--apply` escribe, y lo único que escribe es un issue de seguimiento
 * con título fijo: nunca toca el código ni cierra nada.
 *
 * Corre programado y **no** como gate. La condición que verifica —que el issue citado siga abierto— se
 * vuelve falsa sin que nadie toque el repositorio, así que atarla a un PR haría fallar diffs que no la
 * tocaron. Los checks del repo siguen siendo offline y deterministas.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

import { findExemptIssueRefs } from './block-issue-refs-in-comments.helpers';
import { GOVERNANCE_ISSUE_REFS, findIssueMentions } from './check-issue-refs';
import { listClaudeMarkdownFiles } from './claude-docs-tree';
import {
	classifyIssueState,
	collectTrackedRefs,
	decideAction,
	formatConsoleReport,
	selectStaleRefs,
	selectTrackingIssue,
	type IssueState,
} from './issue-refs-sweep.helpers';

const TRACKING_TITLE = 'Menciones a issues que ya cerraron';
const REPO = 'cuentoneta/cuentoneta';

function gh(...args: string[]): string {
	return execFileSync('gh', args, { encoding: 'utf8' });
}

function tracked(): ReturnType<typeof collectTrackedRefs> {
	const root = process.cwd();
	const docs = listClaudeMarkdownFiles(root).map((file) => ({
		path: file.replace(/\\/g, '/').replace(`${root.replace(/\\/g, '/')}/`, ''),
		mentions: findIssueMentions(readFileSync(file, 'utf8')),
	}));

	const codeFiles = execFileSync('git', ['ls-files', 'src', 'cms', 'scripts'], { encoding: 'utf8' })
		.split('\n')
		.filter(Boolean);
	const code = codeFiles.map((path) => ({
		path,
		refs: findExemptIssueRefs(path, readFileSync(path, 'utf8')).map((ref) => ({
			lineNumber: ref.lineNumber,
			issueNumber: ref.issueNumber,
			kind: ref.kind,
		})),
	}));

	return collectTrackedRefs({ allowlist: GOVERNANCE_ISSUE_REFS, docs, code });
}

/**
 * El estado de cada número. Un 404 es una **cita rota** y se distingue de un cerrado; un número que
 * resuelve a un PR también, porque su `closed` no significa lo mismo y sería un falso positivo
 * permanente. Un fallo de red **no** se traduce a un estado: se propaga, para no reportar nada.
 */
function fetchStates(numbers: number[]): Map<number, IssueState> {
	const states = new Map<number, IssueState>();
	for (const number of numbers) {
		try {
			const raw = gh('api', `repos/${REPO}/issues/${number}`, '--jq', '{state: .state, pr: (.pull_request != null)}');
			const { state, pr } = JSON.parse(raw) as { state: string; pr: boolean };
			states.set(number, classifyIssueState({ state, isPullRequest: pr }));
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			try {
				states.set(number, classifyIssueState({ error: message }));
			} catch {
				throw new Error(`no se pudo consultar el estado de #${number}`, { cause: error });
			}
		}
	}
	return states;
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
	const found = selectTrackingIssue(
		JSON.parse(raw) as { number: number; title: string; body: string }[],
		TRACKING_TITLE,
	);
	return found ? { number: found.number, body: found.body ?? '' } : null;
}

const refs = tracked();
const states = fetchStates([...new Set(refs.map((ref) => ref.issueNumber))]);
const stale = selectStaleRefs(refs, states);

process.stdout.write(`${formatConsoleReport(stale, refs.length)}\n`);

if (!process.argv.includes('--apply')) {
	process.exit(0);
}

const existing = findTrackingIssue();
const action = decideAction({ stale, states, existing });

switch (action.kind) {
	case 'create':
		gh(
			'issue',
			'create',
			'--title',
			TRACKING_TITLE,
			'--body',
			action.body ?? '',
			'--label',
			'🛠️ tooling',
			'--label',
			'🤖 agentes',
		);
		process.stdout.write('seguimiento creado.\n');
		break;
	case 'update':
		gh('issue', 'edit', String(existing?.number), '--body', action.body ?? '');
		process.stdout.write(`seguimiento #${existing?.number} actualizado.\n`);
		break;
	case 'resolved':
		// El cuerpo se actualiza junto con el aviso: quitarle la huella es lo que impide que el aviso
		// se repita cada corrida, porque el job no cierra el seguimiento por diseño.
		gh('issue', 'edit', String(existing?.number), '--body', action.body ?? '');
		gh('issue', 'comment', String(existing?.number), '--body', action.comment ?? '');
		process.stdout.write(`comentado en #${existing?.number}; se cierra a mano.\n`);
		break;
	default:
		process.stdout.write('sin cambios respecto de la corrida anterior.\n');
}
