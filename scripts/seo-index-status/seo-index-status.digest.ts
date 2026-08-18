/**
 * El aviso que la corrida deja en el issue de seguimiento: qué se movió esta semana, si vale la pena
 * decirlo, y con qué texto.
 *
 * Vive aparte de `*.report.ts` porque responde otra pregunta. El reporte describe la corrida entera
 * para quien ya la está mirando; esto decide si interrumpir a alguien que no la está mirando, y con
 * qué. Un aviso semanal idéntico se vuelve invisible en tres semanas, así que el silencio cuando no
 * pasó nada es parte del diseño y no una omisión.
 *
 * Igual que el reporte, solo consume primitivas del núcleo: no deriva un hecho por su cuenta.
 * Tampoco toca `process.env`, `gh` ni la red — la URL de la corrida entra como parámetro.
 */
import {
	CRAWL_STATE,
	CRAWL_STATE_LABELS,
	classifyRunOutcome,
	countByLabel,
	diffCoverageStates,
	diffStates,
	EXIT_CODE,
	observedRows,
	type ClassifiedRow,
	type CoverageTransition,
	type DiffBaseline,
	type StateTransition,
} from './seo-index-status.helpers';

export const TRACKING_TITLE = 'Bitácora semanal del estado de indexado';

/**
 * El cuerpo no lleva hallazgos: es una explicación estable de qué es este issue. Los otros barridos
 * del repositorio reescriben el suyo en cada corrida porque su dato es un conjunto de defectos que se
 * atienden y desaparecen; acá el dato es una serie temporal, y reescribir el cuerpo borraría la
 * corrida anterior, que es todo el valor.
 */
export const TRACKING_BODY = [
	'Este issue es la bitácora del job semanal que mide el estado de indexado contra la URL Inspection',
	'API de Search Console. Cada corrida **con movimiento** deja un comentario; una semana sin novedad',
	'no comenta, para que el aviso no se vuelva rutina.',
	'',
	'Queda abierto a propósito: no hay nada que "resolver". Para enterarte, suscribite a este issue —',
	'que lo cree un bot no notifica a nadie por sí solo.',
	'',
	'La foto completa de cada corrida vive en la rama de datos `seo-metrics`, y su historia es el dato:',
	'cada commit es una medición.',
].join('\n');

const HUELLA_PREFIX = '<!-- huella:';

export interface Digest {
	inspected: number;
	/** Total de transiciones confirmadas de estado. Es lo que decide si hay algo que contar. */
	moves: number;
	toIndexed: StateTransition[];
	firstCrawl: StateTransition[];
	regressions: StateTransition[];
	otherMoves: [string, number][];
	coverageMoves: [string, number][];
	failures: number;
	breakage: boolean;
	checkedAt: string;
	runUrl?: string;
}

export interface DigestInput {
	rows: readonly ClassifiedRow[];
	previous?: readonly DiffBaseline[];
	checkedAt: string;
	runUrl?: string;
}

const MOVE_KIND = Object.freeze({
	toIndexed: 'toIndexed',
	regression: 'regression',
	firstCrawl: 'firstCrawl',
	other: 'other',
} as const);

type MoveKind = (typeof MOVE_KIND)[keyof typeof MOVE_KIND];

/**
 * Las tres preguntas que el issue nombra —cuántas pasaron a indexada, cuántas consiguieron un primer
 * rastreo, qué se perdió— más el resto. El orden importa: una URL que nunca se rastreó y aparece
 * indexada es sobre todo un alta al índice, y contarla en las dos partidas duplicaría el titular.
 */
function classifyMove(move: StateTransition): MoveKind {
	if (move.to === CRAWL_STATE.indexed) {
		return MOVE_KIND.toIndexed;
	}
	if (move.from === CRAWL_STATE.indexed) {
		return MOVE_KIND.regression;
	}
	if (move.from === CRAWL_STATE.neverCrawled) {
		return MOVE_KIND.firstCrawl;
	}
	return MOVE_KIND.other;
}

const stateMoveLabel = (move: StateTransition): string =>
	`${CRAWL_STATE_LABELS[move.from]} → ${CRAWL_STATE_LABELS[move.to]}`;

const coverageMoveLabel = (move: CoverageTransition): string => `${move.from} → ${move.to}`;

export function buildDigest({ rows, previous, checkedAt, runUrl }: DigestInput): Digest {
	const seen = observedRows(rows);
	const baseline = previous ?? [];
	const { transitions } = diffStates(baseline, seen);
	const coverage = diffCoverageStates(baseline, seen);
	const byKind = (kind: MoveKind) => transitions.filter((move) => classifyMove(move) === kind);

	return {
		inspected: rows.length,
		moves: transitions.length,
		toIndexed: byKind(MOVE_KIND.toIndexed),
		firstCrawl: byKind(MOVE_KIND.firstCrawl),
		regressions: byKind(MOVE_KIND.regression),
		otherMoves: countByLabel(byKind(MOVE_KIND.other), stateMoveLabel),
		coverageMoves: countByLabel(coverage.transitions, coverageMoveLabel),
		failures: rows.length - seen.length,
		// Se deriva del clasificador del núcleo en vez de recontarse: es el mismo hecho que fija el
		// código de salida, y dos cuentas separadas podrían discrepar.
		breakage: classifyRunOutcome(rows) !== EXIT_CODE.ok,
		checkedAt,
		...(runUrl !== undefined ? { runUrl } : {}),
	};
}

/**
 * Qué justifica interrumpir. Los movimientos de `coverageState` NO entran: es el eje que oscila entre
 * corridas, y quedarse solo con los pares que importan exigiría ramificar sobre un texto que Google
 * devuelve localizado. Viajan dentro del comentario como contexto de un movimiento que sí cuenta.
 *
 * Lo observado una sola vez tampoco: es exactamente el ruido que el diff separa a propósito, y el
 * resumen de la corrida ya lo informa para quien lo esté mirando.
 */
export function hasNews(digest: Digest): boolean {
	return digest.moves > 0 || digest.breakage;
}

/**
 * Identifica el conjunto de movimientos, no su tamaño: dos semanas distintas pueden mover la misma
 * cantidad de URLs y no ser la misma novedad. Sin la URL en la huella, la segunda se leería como
 * repetición y no se comentaría.
 *
 * Deja afuera la fecha y el enlace a la corrida, que cambian siempre y volverían la huella inútil.
 */
export function fingerprintDigest(digest: Digest): string {
	const moves = [...digest.toIndexed, ...digest.firstCrawl, ...digest.regressions]
		.map((move) => `${move.url}|${move.from}>${move.to}`)
		.concat(digest.otherMoves.map(([label, count]) => `${label}|${count}`))
		.sort();
	return [...moves, digest.breakage ? 'rotura' : ''].filter(Boolean).join(';');
}

function formatHeadlines(digest: Digest): string[] {
	const headlines: string[] = [];
	if (digest.toIndexed.length > 0) {
		headlines.push(`**+${digest.toIndexed.length}** pasaron a indexada`);
	}
	if (digest.firstCrawl.length > 0) {
		headlines.push(`**+${digest.firstCrawl.length}** consiguieron un primer rastreo`);
	}
	if (digest.regressions.length > 0) {
		headlines.push(`**−${digest.regressions.length}** dejaron de estar indexadas`);
	}
	return headlines;
}

function formatMoveList(title: string, moves: readonly StateTransition[]): string[] {
	if (moves.length === 0) {
		return [];
	}
	return ['', `${title}:`, ...moves.map((move) => `- ${move.url}`)];
}

function formatCounts(title: string, counts: readonly [string, number][]): string[] {
	if (counts.length === 0) {
		return [];
	}
	return ['', `${title}:`, ...counts.map(([label, count]) => `- ${label}: ${count}`)];
}

export function formatDigestComment(digest: Digest): string {
	const headlines = formatHeadlines(digest);
	const lines = [
		`### Movimiento de la semana (${digest.checkedAt})`,
		'',
		headlines.length > 0 ? headlines.join(' · ') : 'Sin movimiento de estado.',
		...formatMoveList('Pasaron a indexada', digest.toIndexed),
		...formatMoveList('Primer rastreo', digest.firstCrawl),
		...formatMoveList('Dejaron de estar indexadas', digest.regressions),
		...formatCounts('Otros movimientos', digest.otherMoves),
		...formatCounts('Contexto — movimientos de coverageState', digest.coverageMoves),
	];

	if (digest.breakage) {
		lines.push('', `⚠️ La corrida no midió limpio: ${digest.failures} de ${digest.inspected} inspecciones fallaron.`);
	}
	if (digest.runUrl !== undefined) {
		lines.push('', `[Ver la corrida](${digest.runUrl}) · la foto completa está en la rama \`seo-metrics\`.`);
	}
	lines.push('', `${HUELLA_PREFIX} ${fingerprintDigest(digest)} -->`);

	return lines.join('\n');
}

export type DigestAction =
	| { kind: 'noop'; reason: 'no-news' | 'already-reported' }
	| { kind: 'create'; body: string; comment: string }
	| { kind: 'comment'; comment: string };

export interface DigestActionInput {
	digest: Digest;
	existing: { number: number; lastComment?: string } | null;
}

/**
 * La corrida normal no repite: al persistir la serie, la observación confirmada avanza y el diff
 * siguiente sale vacío. La huella cubre el caso que sí puede repetir — una re-corrida que murió antes
 * de escribir el historial, y que vuelve a producir exactamente los mismos movimientos.
 */
export function decideDigestAction({ digest, existing }: DigestActionInput): DigestAction {
	if (!hasNews(digest)) {
		return { kind: 'noop', reason: 'no-news' };
	}

	const comment = formatDigestComment(digest);
	if (!existing) {
		return { kind: 'create', body: TRACKING_BODY, comment };
	}
	if (existing.lastComment?.includes(`${HUELLA_PREFIX} ${fingerprintDigest(digest)} -->`)) {
		return { kind: 'noop', reason: 'already-reported' };
	}
	return { kind: 'comment', comment };
}
