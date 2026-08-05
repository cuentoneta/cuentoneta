/**
 * Helpers puros del chequeo de estado de indexado (sin I/O): normalización de la respuesta de la
 * URL Inspection API, clasificación, resumen y diff contra una corrida anterior. Separados de
 * `seo-index-status.ts` (auth/red/paginado) para poder testearlos sin credenciales ni tocar la red.
 */
import { parseHtml } from '../e2e/_utils/seo';

/**
 * Estado derivado por nosotros. NO es `coverageState`: ese campo la API lo devuelve como string
 * humano y LOCALIZADO (cambia con `languageCode`), así que no sirve para ramificar. Clasificamos
 * sobre los campos que sí son enums estables (`verdict`, `indexingState`, `robotsTxtState`) más la
 * PRESENCIA de `lastCrawlTime`, que es lo que separa "nunca rastreada" de "rastreada y descartada".
 */
export const CRAWL_STATE = Object.freeze({
	indexed: 'indexed',
	crawledNotIndexed: 'crawled-not-indexed',
	neverCrawled: 'never-crawled',
	blocked: 'blocked',
	failed: 'failed',
} as const);

export type CrawlState = (typeof CRAWL_STATE)[keyof typeof CRAWL_STATE];

export const CRAWL_STATE_LABELS: Readonly<Record<CrawlState, string>> = Object.freeze({
	[CRAWL_STATE.indexed]: 'Indexada',
	[CRAWL_STATE.crawledNotIndexed]: 'Rastreada, no indexada',
	[CRAWL_STATE.neverCrawled]: 'Nunca rastreada',
	[CRAWL_STATE.blocked]: 'Bloqueada para indexar',
	[CRAWL_STATE.failed]: 'La inspección falló',
});

/** Proyección de `indexStatusResult` sobre la que trabajan estos helpers. */
export interface InspectionSnapshot {
	url: string;
	verdict?: string;
	coverageState?: string;
	lastCrawlTime?: string;
	pageFetchState?: string;
	robotsTxtState?: string;
	indexingState?: string;
	googleCanonical?: string;
	userCanonical?: string;
	/** Presente solo si la llamada a la API falló para esta URL. */
	error?: string;
}

export interface ClassifiedRow extends InspectionSnapshot {
	state: CrawlState;
	canonicalMismatch: boolean;
}

const BLOCKING_INDEXING_STATES: readonly string[] = ['BLOCKED_BY_META_TAG', 'BLOCKED_BY_HTTP_HEADER'];

export function parseSitemapLocs(xml: string): string[] {
	return parseHtml(xml)
		.querySelectorAll('loc')
		.map((element) => element.text.trim())
		.filter((loc) => loc.length > 0);
}

/**
 * Una canónica elegida por Google distinta de la declarada explica por sí sola un "no indexada":
 * la página se consolidó en otra URL. Solo se compara cuando Google ya expresó una preferencia.
 */
function hasCanonicalMismatch(snapshot: InspectionSnapshot): boolean {
	const { googleCanonical, userCanonical } = snapshot;
	if (!googleCanonical || !userCanonical) {
		return false;
	}
	return googleCanonical !== userCanonical;
}

export function classify(snapshot: InspectionSnapshot): ClassifiedRow {
	return {
		...snapshot,
		state: resolveState(snapshot),
		canonicalMismatch: hasCanonicalMismatch(snapshot),
	};
}

function resolveState(snapshot: InspectionSnapshot): CrawlState {
	if (snapshot.error) {
		return CRAWL_STATE.failed;
	}
	if (snapshot.robotsTxtState === 'DISALLOWED' || BLOCKING_INDEXING_STATES.includes(snapshot.indexingState ?? '')) {
		return CRAWL_STATE.blocked;
	}
	if (snapshot.verdict === 'PASS') {
		return CRAWL_STATE.indexed;
	}
	// La ausencia de `lastCrawlTime` es el discriminador: la API lo OMITE cuando Google nunca fetcheó
	// la URL ("Descubierta, actualmente no indexada" / "URL desconocida"), y solo ahí.
	return snapshot.lastCrawlTime ? CRAWL_STATE.crawledNotIndexed : CRAWL_STATE.neverCrawled;
}

export type StateCounts = Readonly<Record<CrawlState, number>>;

export function summarize(rows: readonly ClassifiedRow[]): StateCounts {
	const counts: Record<CrawlState, number> = {
		[CRAWL_STATE.indexed]: 0,
		[CRAWL_STATE.crawledNotIndexed]: 0,
		[CRAWL_STATE.neverCrawled]: 0,
		[CRAWL_STATE.blocked]: 0,
		[CRAWL_STATE.failed]: 0,
	};
	for (const row of rows) {
		counts[row.state] += 1;
	}
	return counts;
}

/** Agrupa por el texto crudo de `coverageState`, que es lo que muestra el informe de la UI. */
export function groupByCoverageState(rows: readonly ClassifiedRow[]): Map<string, number> {
	const groups = new Map<string, number>();
	for (const row of rows) {
		const key = row.coverageState ?? '(sin coverageState)';
		groups.set(key, (groups.get(key) ?? 0) + 1);
	}
	return groups;
}

/** Observación anterior de una URL, conservada para poder leer su evolución. */
export interface HistoryEntry {
	checkedAt: string;
	state: CrawlState;
	coverageState?: string;
}

export interface StoredRow extends ClassifiedRow {
	/** ISO de la corrida que produjo esta fila. */
	checkedAt: string;
	/**
	 * Observaciones previas, de la más vieja a la más nueva. Solo se agrega una entrada cuando el
	 * estado o el `coverageState` cambiaron: repetir la misma medición no debe hacer crecer el
	 * archivo, y lo que interesa de la serie son justamente los puntos donde se movió.
	 */
	history?: HistoryEntry[];
}

/**
 * La foto se indexa por URL, no por corrida. Guardarla como un array plano por corrida hacía que
 * inspeccionar un subconjunto distinto PISARA el anterior, y el diff terminaba comparando conjuntos
 * ajenos. La URL es la unidad natural del historial: así cada corrida actualiza lo que miró y deja
 * intacto el resto, y da igual qué subconjunto elijas cada vez.
 */
export type SnapshotStore = Record<string, StoredRow>;

function movedSinceLastRun(previous: StoredRow | undefined, row: ClassifiedRow): boolean {
	if (!previous) {
		return false;
	}
	return previous.state !== row.state || previous.coverageState !== row.coverageState;
}

export function mergeSnapshot(store: SnapshotStore, rows: readonly ClassifiedRow[], checkedAt: string): SnapshotStore {
	const merged: SnapshotStore = { ...store };
	for (const row of rows) {
		const previous = store[row.url];
		const history = previous?.history ?? [];
		merged[row.url] = {
			...row,
			checkedAt,
			// La entrada archivada es la observación ANTERIOR, no la nueva: los campos de primer nivel
			// siempre son el presente, y `history` el camino que llevó hasta él.
			history: movedSinceLastRun(previous, row)
				? [
						...history,
						{
							checkedAt: previous?.checkedAt ?? '',
							state: previous?.state ?? row.state,
							coverageState: previous?.coverageState,
						},
					]
				: history,
		};
	}
	return merged;
}

export function storedRows(store: SnapshotStore): StoredRow[] {
	return Object.values(store);
}

export interface StateTransition {
	url: string;
	from: CrawlState;
	to: CrawlState;
}

export interface CoverageTransition {
	url: string;
	from: string;
	to: string;
}

const UNREPORTED_COVERAGE = '(sin coverageState)';

/**
 * Movimientos de `coverageState` que NO cambian el estado derivado. Existe porque la clasificación es
 * más gruesa que lo que informa Google: "Discovered - currently not indexed" y "URL is unknown to
 * Google" caen ambos en "nunca rastreada", así que una URL que Google deja de conocer se ve idéntica
 * a una que sigue en cola. Ese movimiento es justamente el que interesa vigilar, y sin esto es mudo.
 */
export function diffCoverageStates(
	previous: readonly ClassifiedRow[],
	current: readonly ClassifiedRow[],
): CoverageTransition[] {
	const before = new Map(previous.map((row) => [row.url, row.coverageState]));
	const transitions: CoverageTransition[] = [];

	for (const row of current) {
		if (!before.has(row.url)) {
			continue;
		}
		const from = before.get(row.url) ?? UNREPORTED_COVERAGE;
		const to = row.coverageState ?? UNREPORTED_COVERAGE;
		if (from !== to) {
			transitions.push({ url: row.url, from, to });
		}
	}
	return transitions;
}

/**
 * Diff contra la corrida anterior. El valor de la herramienta no está en una foto suelta sino en la
 * serie: "cuántas pasaron a indexada desde la última corrida" es la pregunta que la pantalla de
 * validación de Search Console no contesta.
 */
export function diffStates(
	previous: readonly ClassifiedRow[],
	current: readonly ClassifiedRow[],
): { transitions: StateTransition[]; added: string[] } {
	const before = new Map(previous.map((row) => [row.url, row.state]));
	const transitions: StateTransition[] = [];
	const added: string[] = [];

	for (const row of current) {
		const from = before.get(row.url);
		if (from === undefined) {
			added.push(row.url);
		} else if (from !== row.state) {
			transitions.push({ url: row.url, from, to: row.state });
		}
	}
	return { transitions, added };
}

function formatCounts(counts: StateCounts): string[] {
	return Object.values(CRAWL_STATE)
		.filter((state) => counts[state] > 0)
		.map((state) => `  ${CRAWL_STATE_LABELS[state].padEnd(24)} ${String(counts[state]).padStart(5)}`);
}

function formatCoverageStates(rows: readonly ClassifiedRow[]): string[] {
	return [...groupByCoverageState(rows)]
		.sort(([, a], [, b]) => b - a)
		.map(([label, count]) => `  ${String(count).padStart(5)}  ${label}`);
}

function formatTransitions(transitions: readonly StateTransition[]): string[] {
	if (transitions.length === 0) {
		return ['  (sin cambios de estado)'];
	}
	return transitions.map(
		(change) => `  ${CRAWL_STATE_LABELS[change.from]} → ${CRAWL_STATE_LABELS[change.to]}: ${change.url}`,
	);
}

/** Agrupa por el par (desde → hasta): el conteo es la lectura útil, no la lista de URLs. */
function formatCoverageTransitions(transitions: readonly CoverageTransition[]): string[] {
	const grouped = new Map<string, number>();
	for (const change of transitions) {
		const key = `${change.from} → ${change.to}`;
		grouped.set(key, (grouped.get(key) ?? 0) + 1);
	}
	return [...grouped].sort(([, a], [, b]) => b - a).map(([label, count]) => `  ${String(count).padStart(5)}  ${label}`);
}

export interface ReportInput {
	rows: readonly ClassifiedRow[];
	previous?: readonly ClassifiedRow[];
}

export function formatReport({ rows, previous }: ReportInput): string[] {
	const lines = [
		'',
		`Resultado sobre ${rows.length} URL(s):`,
		...formatCounts(summarize(rows)),
		'',
		'coverageState informado por Google:',
		...formatCoverageStates(rows),
	];

	const mismatches = rows.filter((row) => row.canonicalMismatch);
	if (mismatches.length > 0) {
		lines.push('', `Canónica distinta de la declarada (${mismatches.length}):`);
		// Se imprimen LAS DOS, alineadas: el caso real difiere en un solo carácter (una doble barra
		// `.ar//story/…`), y mostrando solo la de Google el hallazgo se lee como dos URLs idénticas.
		lines.push(
			...mismatches.map(
				(row) => `  ${row.url}\n      declarada:     ${row.userCanonical}\n      Google eligió: ${row.googleCanonical}`,
			),
		);
	}

	const failures = rows.filter((row) => row.state === CRAWL_STATE.failed);
	if (failures.length > 0) {
		lines.push('', `Inspecciones fallidas (${failures.length}):`);
		lines.push(...failures.map((row) => `  ${row.url} — ${row.error}`));
	}

	if (previous) {
		const { transitions, added } = diffStates(previous, rows);
		lines.push('', `Cambios contra el historial (${previous.length} URL(s) conocidas):`);
		lines.push(...formatTransitions(transitions));

		const coverageMoves = diffCoverageStates(previous, rows);
		if (coverageMoves.length > 0) {
			lines.push('', `Movimientos de coverageState (${coverageMoves.length}):`);
			lines.push(...formatCoverageTransitions(coverageMoves));
		}

		if (added.length > 0) {
			lines.push(`  ${added.length} URL(s) inspeccionadas por primera vez`);
		}
		// Una corrida parcial no debe leerse como cobertura total: se explicita qué quedó sin mirar.
		const inspected = new Set(rows.map((row) => row.url));
		const skipped = previous.filter((row) => !inspected.has(row.url)).length;
		if (skipped > 0) {
			lines.push(`  ${skipped} URL(s) del historial NO se inspeccionaron en esta corrida`);
		}
	}

	return lines;
}
