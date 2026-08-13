/**
 * Helpers puros del chequeo de estado de indexado (sin I/O): normalización de la respuesta de la
 * URL Inspection API, clasificación, resumen y diff contra una corrida anterior. Separados de
 * `seo-index-status.ts` (auth/red/paginado) para poder testearlos sin credenciales ni tocar la red.
 */
import { locations } from '../../src/testing/sitemap-xml';

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
	/** Presente solo si la inspección consumió más de un intento. */
	attempts?: number;
}

export interface ClassifiedRow extends InspectionSnapshot {
	state: CrawlState;
	canonicalMismatch: boolean;
}

/** Campos de `indexStatusResult` que se retienen, en el orden en que se leen. */
const INSPECTED_FIELDS = [
	'verdict',
	'coverageState',
	'lastCrawlTime',
	'pageFetchState',
	'robotsTxtState',
	'indexingState',
	'googleCanonical',
	'userCanonical',
] as const satisfies readonly (keyof InspectionSnapshot)[];

/**
 * Lo mínimo que se le pide al resultado de la API: los campos retenidos, cada uno opcional y de tipo
 * libre. Se declara acá en vez de importar el tipo generado del cliente para que el núcleo puro no
 * dependa del paquete de Google — es lo que permite testearlo sin credenciales ni red.
 */
type InspectedFields = Partial<Record<(typeof INSPECTED_FIELDS)[number], unknown>>;

/**
 * La API omite un campo devolviéndolo `null`, y el resto del módulo distingue "ausente"
 * (`undefined`) de "presente y vacío": `resolveState` clasifica por la **presencia** de
 * `lastCrawlTime`, así que un `null` que llegara sin normalizar se leería como rastreada.
 */
export function toSnapshot(url: string, status: InspectedFields | undefined): InspectionSnapshot {
	const snapshot: InspectionSnapshot = { url };
	for (const field of INSPECTED_FIELDS) {
		const value = status?.[field];
		if (typeof value === 'string') {
			snapshot[field] = value;
		}
	}
	return snapshot;
}

const BLOCKING_INDEXING_STATES: readonly string[] = ['BLOCKED_BY_META_TAG', 'BLOCKED_BY_HTTP_HEADER'];

export function parseSitemapLocs(xml: string): string[] {
	return locations(xml)
		.map((loc) => loc.trim())
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

/**
 * Etiqueta para una URL sobre la que Google no informó `coverageState`. La comparten el resumen y el
 * diff: si cada uno tuviera la suya, una fila del resumen y su movimiento dejarían de nombrar lo mismo.
 */
const UNREPORTED_COVERAGE = '(sin coverageState)';

export const DEFAULT_SAMPLE_SIZE = 25;

/**
 * Un `--sample` inválido corta la corrida en vez de degradarla. `Number('abc')` da `NaN`, y
 * `slice(0, NaN)` devuelve cero elementos: la herramienta reportaría "0 URL(s)" y saldría en verde,
 * indistinguible de un sitio sin nada que inspeccionar.
 */
export function parseSampleSize(raw: string | undefined): number {
	if (raw === undefined) {
		return DEFAULT_SAMPLE_SIZE;
	}

	const size = Number(raw);
	if (!Number.isInteger(size) || size < 1) {
		throw new Error(`--sample espera un entero positivo, y recibió "${raw}".`);
	}
	return size;
}

/** El reloj que usa el pacer, inyectado para poder afirmar su espaciado sin esperarlo de verdad. */
export interface PacerClock {
	now: () => number;
	sleep: (ms: number) => Promise<void>;
}

/**
 * Espaciado GLOBAL entre despachos, compartido por todos los workers. Un `delay` dentro de cada
 * worker no sirve: espaciaría por worker, así que N workers multiplicarían la tasa por N y se
 * excedería la cuota por minuto. El cursor `nextAt` se reserva de forma **síncrona** antes de
 * esperar, y por eso dos workers nunca se adjudican la misma ranura.
 */
export function createPacer(spacingMs: number, clock: PacerClock): () => Promise<void> {
	let nextAt = 0;
	return async () => {
		const now = clock.now();
		const scheduled = Math.max(now, nextAt);
		nextAt = scheduled + spacingMs;
		await clock.sleep(scheduled - now);
	};
}

/** Agrupa por el texto crudo de `coverageState`, que es lo que muestra el informe de la UI. */
export function groupByCoverageState(rows: readonly ClassifiedRow[]): Map<string, number> {
	const groups = new Map<string, number>();
	for (const row of rows) {
		const key = row.coverageState ?? UNREPORTED_COVERAGE;
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

/** Distingue una URL que agotó sus reintentos de otra que falló de entrada y no se reintentó. */
function formatAttempts(attempts: number | undefined): string {
	return attempts !== undefined && attempts > 1 ? ` (tras ${attempts} intentos)` : '';
}

export interface ReportInput {
	rows: readonly ClassifiedRow[];
	previous?: readonly ClassifiedRow[];
	/** Reintentos que consumió la corrida. Se informa solo si hubo alguno. */
	retries?: number;
}

export function formatReport({ rows, previous, retries }: ReportInput): string[] {
	const lines = [
		'',
		`Resultado sobre ${rows.length} URL(s):`,
		...formatCounts(summarize(rows)),
		'',
		'coverageState informado por Google:',
		...formatCoverageStates(rows),
	];

	if (retries !== undefined && retries > 0) {
		lines.push('', `Reintentos consumidos: ${retries}`);
	}

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
		lines.push(...failures.map((row) => `  ${row.url} — ${row.error}${formatAttempts(row.attempts)}`));
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
