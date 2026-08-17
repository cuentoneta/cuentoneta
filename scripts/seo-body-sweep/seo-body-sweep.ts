/**
 * Barrido de cuerpos: recorre TODAS las URLs del sitemap afirmando un solo invariante —que la página
 * sirve un `<main>` con contenido— y reporta las que no.
 *
 * Es el complemento de la muestra aleatoria del smoke, no su reemplazo. El smoke afirma el set
 * completo de invariantes sobre pocas URLs y falla; este afirma uno solo sobre todas y reporta. La
 * muestra descubre problemas nuevos; el barrido garantiza que un defecto extendido no dependa del
 * sorteo para aparecer.
 *
 * Acá vive la orquestación y nada más: qué significa cada respuesta, qué se reintenta y qué se
 * escribe lo deciden `seo-body-sweep.helpers.ts` y `seo-body-sweep.report.ts`, que se ejercitan sin red.
 */
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

import { parseSitemap } from '../seo-smoke.helpers';
import {
	classifyResponse,
	classifyRunOutcome,
	EXIT_CODES,
	isTransientFailure,
	isTransientStatus,
	runWithRetries,
	TransientResponseError,
	type PageResult,
} from './seo-body-sweep.helpers';
import {
	buildReport,
	decideAction,
	formatConsoleReport,
	formatSummaryMarkdown,
	type SweepReport,
} from './seo-body-sweep.report';

const TRACKING_TITLE = 'Páginas del sitemap que sirven un cuerpo vacío';
// Identificable a propósito: un barrido de ~1000 requests contra el propio origen tiene que poder
// reconocerse en los logs de acceso sin confundirse con un crawler ajeno.
const USER_AGENT = 'cuentoneta-seo-body-sweep';
const DEFAULT_CONCURRENCY = 6;

// Apuntar a producción es una decisión explícita de quien corre, no un default silencioso.
const baseUrl = (process.env['BASE_URL'] ?? 'http://localhost:4000').replace(/\/$/, '');

function flag(name: string): string | undefined {
	return process.argv
		.find((argument) => argument.startsWith(`--${name}=`))
		?.split('=')
		.slice(1)
		.join('=');
}

function numericFlag(name: string, fallback: number): number {
	const raw = flag(name);
	const parsed = raw === undefined ? Number.NaN : Number.parseInt(raw, 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const concurrency = numericFlag('concurrency', DEFAULT_CONCURRENCY);
const limit = numericFlag('limit', Number.POSITIVE_INFINITY);
const summaryPath = flag('summary');
const shouldApply = process.argv.includes('--apply');

function gh(...args: string[]): string {
	return execFileSync('gh', args, { encoding: 'utf8' });
}

async function fetchPage(path: string): Promise<{ status: number; html: string }> {
	const response = await fetch(`${baseUrl}${path}`, { headers: { 'user-agent': USER_AGENT } });
	// El status transitorio se eleva a excepción porque `fetch` resuelve con un 503 en vez de rechazar:
	// sin esto, `runWithRetries` no tendría nada que reintentar.
	if (isTransientStatus(response.status)) {
		throw new TransientResponseError(response.status);
	}
	return { status: response.status, html: await response.text() };
}

async function sweepPath(path: string): Promise<PageResult> {
	const attempt = await runWithRetries(() => fetchPage(path), {
		sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
		isTransient: isTransientFailure,
	});
	if (attempt.ok) {
		return { path, outcome: classifyResponse(attempt.value) };
	}
	return {
		path,
		outcome: { kind: 'unmeasured', reason: describeFailure(attempt.error, attempt.attempts) },
	};
}

function describeFailure(error: unknown, attempts: number): string {
	const detail = error instanceof Error ? error.message : String(error);
	return `${detail} (${attempts} ${attempts === 1 ? 'intento' : 'intentos'})`;
}

/**
 * Pool de workers que se reparten una cola compartida. Acota por construcción cuántas requests hay en
 * vuelo, que es lo que mantiene cortés un barrido de este tamaño contra el propio origen.
 */
async function sweepAll(paths: readonly string[]): Promise<PageResult[]> {
	const queue = [...paths];
	const results: PageResult[] = [];
	const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
		for (let path = queue.shift(); path !== undefined; path = queue.shift()) {
			results.push(await sweepPath(path));
		}
	});
	await Promise.all(workers);
	return results;
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

	if (action.kind === 'noop') {
		process.stdout.write('sin cambios respecto de la corrida anterior.\n');
		return;
	}
	if (action.kind === 'create') {
		gh('issue', 'create', '--title', TRACKING_TITLE, '--body', action.body, '--label', '🧭 indexado');
		process.stdout.write('seguimiento creado.\n');
		return;
	}

	// Las dos ramas restantes editan el seguimiento, así que sin él no hay nada que editar: `gh`
	// recibiría el literal "undefined" como número y fallaría con un mensaje que no dice qué pasó.
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

async function readSitemapPaths(): Promise<string[]> {
	const url = `${baseUrl}/sitemap.xml`;
	// El error de `fetch` dice "fetch failed" y nada más: sin la URL a la vista, un BASE_URL mal puesto
	// y un origen caído se diagnostican igual de mal.
	const response = await fetch(url, { headers: { 'user-agent': USER_AGENT } }).catch((cause: unknown) => {
		throw new Error(`no se pudo pedir el sitemap en ${url}`, { cause });
	});
	if (!response.ok) {
		throw new Error(`el sitemap respondió ${response.status}: sin él no hay barrido que hacer`);
	}
	const paths = parseSitemap(await response.text());
	if (paths.length === 0) {
		throw new Error('el sitemap no declara ninguna URL');
	}
	return paths.slice(0, limit);
}

async function main(): Promise<number> {
	const paths = await readSitemapPaths();
	process.stdout.write(`barriendo ${paths.length} URLs de ${baseUrl} (concurrencia ${concurrency})…\n`);

	const results = await sweepAll(paths);
	const report = buildReport(results);
	process.stdout.write(`${formatConsoleReport(report)}\n`);

	// Append, nunca truncar: el destino es de quien lo pasó y suele traer lo que escribieron otros steps.
	if (summaryPath) {
		appendFileSync(summaryPath, formatSummaryMarkdown(report));
	}
	if (shouldApply) {
		applyAction(report);
	}
	return classifyRunOutcome(results);
}

main()
	.then((code) => {
		process.exitCode = code;
	})
	.catch((error: unknown) => {
		const cause = error instanceof Error && error.cause instanceof Error ? `: ${error.cause.message}` : '';
		process.stderr.write(`${error instanceof Error ? error.message : String(error)}${cause}\n`);
		process.exitCode = EXIT_CODES.toolFailure;
	});
