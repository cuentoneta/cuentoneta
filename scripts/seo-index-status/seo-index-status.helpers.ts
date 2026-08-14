/**
 * Helpers puros del chequeo de estado de indexado (sin I/O): normalización de la respuesta de la
 * URL Inspection API, clasificación, resumen y diff contra una corrida anterior. Separados de
 * `seo-index-status.ts` (auth/red/paginado) para poder testearlos sin credenciales ni tocar la red.
 */
import { dirname, join } from 'node:path';
import { locations } from '../../src/testing/sitemap-xml';
import { readHttpStatus, type RetryResult } from './seo-index-status.retry';

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
	/**
	 * Status HTTP de esa falla, cuando se lo pudo leer. Es lo que permite separar un fallo de la
	 * herramienta de uno transitorio sin ramificar sobre el texto del mensaje, que cambia con la
	 * versión y con el idioma.
	 */
	errorStatus?: number;
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

/**
 * Códigos de salida de la corrida. Existen tres y no dos porque un job programado tiene que poder
 * distinguir "la herramienta no pudo medir" de "midió, y algunas inspecciones sueltas erraron": lo
 * primero es un fallo suyo y merece rojo; lo segundo es ruido residual de la API, y pintarlo de rojo
 * cada semana vacía de significado al rojo.
 */
export const EXIT_CODE = Object.freeze({
	ok: 0,
	toolFailure: 1,
	partialFailure: 2,
} as const);

/**
 * Statuses que no cambian si se vuelve a intentar y que señalan a la herramienta, no a la API: los
 * parámetros del pedido, las credenciales, el permiso sobre la propiedad y la cuota ya agotada. Una
 * sola fila con cualquiera de estos condena la corrida entera, porque la causa es común a todas.
 */
const TOOL_FAILURE_STATUSES: readonly number[] = [400, 401, 403, 429];

/**
 * Traduce el desenlace de la corrida al código de salida. Una corrida sin una sola observación no
 * midió nada —el caso de la API caída—, y reportarla en verde sería exactamente el rojo que dejó de
 * significar algo, al revés.
 */
export function classifyRunOutcome(rows: readonly ClassifiedRow[]): number {
	if (rows.length === 0) {
		return EXIT_CODE.toolFailure;
	}

	const failed = rows.filter((row) => row.state === CRAWL_STATE.failed);
	if (failed.length === 0) {
		return EXIT_CODE.ok;
	}
	if (failed.length === rows.length) {
		return EXIT_CODE.toolFailure;
	}
	return failed.some((row) => row.errorStatus !== undefined && TOOL_FAILURE_STATUSES.includes(row.errorStatus))
		? EXIT_CODE.toolFailure
		: EXIT_CODE.partialFailure;
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

/** Dónde vive la serie cuando nadie lo dice: gitignoreado, junto al resto de lo efímero. */
const DEFAULT_HISTORY_FILE = join('tmp', 'seo-index-status', 'latest.json');

export interface HistoryPaths {
	file: string;
	dir: string;
}

/**
 * El directorio se deriva del archivo en vez de pedirse aparte: son un solo dato, y admitir que
 * discrepen habilita una corrida que crea un directorio y escribe en otro.
 */
export function resolveHistoryPaths(raw: string | undefined): HistoryPaths {
	const file = raw === undefined || raw.length === 0 ? DEFAULT_HISTORY_FILE : raw;
	return { file, dir: dirname(file) };
}

function movedSinceLastRun(previous: StoredRow | undefined, row: ClassifiedRow): boolean {
	if (!previous) {
		return false;
	}
	return previous.state !== row.state || previous.coverageState !== row.coverageState;
}

/**
 * La entrada archivada es la observación ANTERIOR, no la nueva: los campos de primer nivel siempre
 * son el presente, y `history` el camino que llevó hasta él.
 */
function historyAfter(previous: StoredRow | undefined, row: ClassifiedRow): HistoryEntry[] {
	const history = previous?.history ?? [];
	if (!movedSinceLastRun(previous, row)) {
		return history;
	}
	return [
		...history,
		{
			checkedAt: previous?.checkedAt ?? '',
			state: previous?.state ?? row.state,
			coverageState: previous?.coverageState,
		},
	];
}

export function mergeSnapshot(store: SnapshotStore, rows: readonly ClassifiedRow[], checkedAt: string): SnapshotStore {
	const merged: SnapshotStore = { ...store };
	for (const row of rows) {
		// Una inspección que no ocurrió no desplaza a una que sí. Sin esto, una corrida con la
		// credencial vencida reescribiría el archivo entero como fallido, y el diff de la corrida
		// siguiente sería un muro de transiciones inventadas.
		if (row.state === CRAWL_STATE.failed) {
			continue;
		}
		merged[row.url] = {
			...row,
			checkedAt,
			history: historyAfter(store[row.url], row),
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

export function messageOf(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

/**
 * Traduce el desenlace de los intentos a la fila que se persiste. `attempts` viaja **solo cuando hubo
 * reintento**, gane o pierda: en el caso normal —que es la abrumadora mayoría de las filas— sería
 * ruido repetido en cada entrada del historial.
 */
export function snapshotOf(url: string, result: RetryResult<InspectionSnapshot>): InspectionSnapshot {
	const attempts = result.attempts > 1 ? { attempts: result.attempts } : {};
	if (result.ok) {
		return { ...result.value, ...attempts };
	}

	const status = readHttpStatus(result.error);
	const errorStatus = status !== undefined ? { errorStatus: status } : {};
	return { url, error: messageOf(result.error), ...errorStatus, ...attempts };
}
