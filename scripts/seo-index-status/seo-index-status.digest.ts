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
import { createHash } from 'node:crypto';

import {
	CRAWL_STATE,
	CRAWL_STATE_LABELS,
	classifyRunOutcome,
	countByLabel,
	diffCoverageStates,
	diffStates,
	EXIT_CODE,
	observedRows,
	withOverflowNote,
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
	/**
	 * Todas las transiciones confirmadas de estado. Las cuatro particiones de abajo son su lectura
	 * agregada, para el texto; la huella se deriva de acá, que es lo único que identifica el conjunto.
	 */
	transitions: StateTransition[];
	toIndexed: StateTransition[];
	firstCrawl: StateTransition[];
	regressions: StateTransition[];
	otherMoves: [string, number][];
	coverageMoves: [string, number][];
	failures: number;
	breakage: boolean;
	/**
	 * Por qué se rompió, cuando la corrida abortó antes de medir. Una corrida que sí midió no lo trae:
	 * ahí la causa la cuenta el par `failures`/`inspected`, y este campo quedaría vacío o repetido.
	 */
	abortedBecause?: string;
	checkedAt: string;
	runUrl?: string;
}

export interface DigestInput {
	rows: readonly ClassifiedRow[];
	previous?: readonly DiffBaseline[];
	checkedAt: string;
	runUrl?: string;
	/** El mensaje del error que cortó la corrida, cuando la hubo. */
	abortedBecause?: string;
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

export function buildDigest({ rows, previous, checkedAt, runUrl, abortedBecause }: DigestInput): Digest {
	const seen = observedRows(rows);
	const baseline = previous ?? [];
	const { transitions } = diffStates(baseline, seen);
	const coverage = diffCoverageStates(baseline, seen);
	const byKind = (kind: MoveKind) => transitions.filter((move) => classifyMove(move) === kind);

	return {
		inspected: rows.length,
		transitions,
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
		...(abortedBecause !== undefined ? { abortedBecause } : {}),
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
	return digest.transitions.length > 0 || digest.breakage;
}

/**
 * Identifica el conjunto de movimientos, no su tamaño: dos semanas distintas pueden mover la misma
 * cantidad de URLs y no ser la misma novedad. Se deriva de `transitions` —todas, no de las particiones
 * agregadas— porque la URL es lo único que distingue dos conjuntos del mismo tamaño, y agregar por par
 * de estados justo en la clase "otros" borraría la distinción donde más importa: ahí cae la URL que
 * Google deja de conocer.
 *
 * La rotura entra con su magnitud, para que dos semanas rotas de gravedad distinta no se lean como la
 * misma. Quedan afuera la fecha y el enlace a la corrida, que cambian siempre y volverían la huella
 * inútil.
 */
export function fingerprintDigest(digest: Digest): string {
	const moves = digest.transitions.map((move) => `${move.url}|${move.from}>${move.to}`).sort();
	const rotura = digest.abortedBecause ?? (digest.breakage ? String(digest.failures) : undefined);
	const canonical = [...moves, rotura !== undefined ? `rotura:${rotura}` : ''].filter(Boolean).join(';');
	// Se hashea porque la huella viaja dentro del comentario: en crudo crece con cada movimiento, y una
	// semana de varios cientos consumiría sola buena parte del tamaño máximo que GitHub acepta.
	return createHash('sha256').update(canonical).digest('hex').slice(0, 16);
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

/**
 * Acota con el mismo tope que el resumen de la corrida. Sin él, la semana que el job existe para
 * celebrar —un lote grande de primeros rastreos— produce un comentario ilegible y, pasado el límite de
 * tamaño de un comentario de GitHub, uno que la API rechaza: la bitácora se quedaría sin la entrada
 * justo cuando más tenía para decir.
 */
function formatMoveList(title: string, moves: readonly StateTransition[]): string[] {
	if (moves.length === 0) {
		return [];
	}
	const urls = withOverflowNote(moves.map((move) => move.url));
	return ['', `${title} (${moves.length}):`, ...urls.map((url) => `- ${url}`)];
}

/**
 * Toda etiqueta va entre backticks, aunque solo una de las dos listas que pasan por acá lo necesite:
 * las de `coverageState` son texto libre que devuelve Google, y sin escapar, un valor con sintaxis de
 * Markdown rompe el formato del comentario o disfraza un enlace. Distinguir cuál escapar según quién
 * llama dejaría la decisión en el llamador, que es donde se olvida.
 */
function formatCounts(title: string, counts: readonly [string, number][]): string[] {
	if (counts.length === 0) {
		return [];
	}
	const rows = withOverflowNote(counts.map(([label, count]) => `\`${label}\`: ${count}`));
	return ['', `${title}:`, ...rows.map((row) => `- ${row}`)];
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

	if (digest.abortedBecause !== undefined) {
		lines.push('', `⚠️ La corrida no llegó a medir: ${digest.abortedBecause}`);
	} else if (digest.breakage) {
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
	// El número viaja en la variante que lo necesita: el llamador no tiene que sostener por su cuenta
	// que si la acción es `comment` entonces el issue existe.
	| { kind: 'comment'; issue: number; comment: string };

export interface DigestActionInput {
	digest: Digest;
	/**
	 * `comments` son los que dejó el propio job, no los del issue: la bitácora invita a suscribirse, y
	 * mirar solo el último rompería la idempotencia en cuanto una persona comente.
	 */
	existing: { number: number; comments?: readonly string[] } | null;
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

	const huella = `${HUELLA_PREFIX} ${fingerprintDigest(digest)} -->`;
	if (existing.comments?.some((published) => published.includes(huella))) {
		return { kind: 'noop', reason: 'already-reported' };
	}
	return { kind: 'comment', issue: existing.number, comment };
}
