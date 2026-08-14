/**
 * Presentación del resultado de una corrida. Vive aparte del núcleo de clasificación porque responde
 * otra pregunta —cómo se lee lo medido, no qué significa—, y porque hay más de una respuesta: el log
 * de la corrida y el resumen de la página del job se leen en contextos distintos.
 *
 * Solo consume las primitivas exportadas por el núcleo (`summarize`, `diffStates`,
 * `diffCoverageStates`): la presentación nunca deriva un hecho por su cuenta.
 */
import {
	CRAWL_STATE,
	CRAWL_STATE_LABELS,
	diffCoverageStates,
	diffStates,
	groupByCoverageState,
	summarize,
	type ClassifiedRow,
	type CoverageTransition,
	type StateCounts,
	type StateTransition,
} from './seo-index-status.helpers';

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

/** Agrupa por etiqueta y ordena por frecuencia, que es la lectura útil de un conjunto de movimientos. */
function countByLabel<T>(items: readonly T[], labelOf: (item: T) => string): [string, number][] {
	const grouped = new Map<string, number>();
	for (const item of items) {
		const label = labelOf(item);
		grouped.set(label, (grouped.get(label) ?? 0) + 1);
	}
	return [...grouped].sort(([, a], [, b]) => b - a);
}

const coverageMoveLabel = (change: CoverageTransition): string => `${change.from} → ${change.to}`;

const stateMoveLabel = (change: StateTransition): string =>
	`${CRAWL_STATE_LABELS[change.from]} → ${CRAWL_STATE_LABELS[change.to]}`;

/** Agrupa por el par (desde → hasta): el conteo es la lectura útil, no la lista de URLs. */
function formatCoverageTransitions(transitions: readonly CoverageTransition[]): string[] {
	return countByLabel(transitions, coverageMoveLabel).map(
		([label, count]) => `  ${String(count).padStart(5)}  ${label}`,
	);
}

/**
 * Las filas que sí son una observación. Todo diff se deriva de acá: una inspección fallida no tiene
 * un estado que comparar, y diffearla produciría un `Indexada → La inspección falló` que informa la
 * falla —ya contada aparte— disfrazada de movimiento del indexado. Es la misma razón por la que el
 * historial tampoco la persiste.
 */
function observed(rows: readonly ClassifiedRow[]): ClassifiedRow[] {
	return rows.filter((row) => row.state !== CRAWL_STATE.failed);
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
		const seen = observed(rows);
		const { transitions, added } = diffStates(previous, seen);
		lines.push('', `Cambios contra el historial (${previous.length} URL(s) conocidas):`);
		lines.push(...formatTransitions(transitions));

		const coverageMoves = diffCoverageStates(previous, seen);
		if (coverageMoves.length > 0) {
			lines.push('', `Movimientos de coverageState (${coverageMoves.length}):`);
			lines.push(...formatCoverageTransitions(coverageMoves));
		}

		if (added.length > 0) {
			lines.push(`  ${added.length} URL(s) inspeccionadas por primera vez`);
		}
		// Una corrida parcial no debe leerse como cobertura total: se explicita qué quedó sin mirar.
		const inspected = new Set(seen.map((row) => row.url));
		const skipped = previous.filter((row) => !inspected.has(row.url)).length;
		if (skipped > 0) {
			lines.push(`  ${skipped} URL(s) del historial NO se inspeccionaron en esta corrida`);
		}
	}

	return lines;
}

export interface SummaryInput extends ReportInput {
	/** ISO de la corrida. El mismo que se persiste en el historial, para que no puedan discrepar. */
	checkedAt: string;
}

/** Cuántos detalles largos entran antes de que el resumen deje de leerse de un vistazo. */
const SUMMARY_DETAIL_LIMIT = 10;

function markdownTable(headers: readonly [string, string], rows: readonly [string, number][]): string[] {
	return [
		'',
		`| ${headers[0]} | ${headers[1]} |`,
		'| --- | ---: |',
		...rows.map(([label, count]) => `| ${label} | ${count} |`),
	];
}

function summaryStates(rows: readonly ClassifiedRow[]): string[] {
	const counts = summarize(rows);
	const present = Object.values(CRAWL_STATE)
		.filter((state) => counts[state] > 0)
		.map((state): [string, number] => [CRAWL_STATE_LABELS[state], counts[state]]);
	return markdownTable(['Estado', 'URLs'], present);
}

/**
 * El movimiento se expresa por TRANSICIONES y nunca restando los conteos de dos corridas: el
 * historial contiene URLs que esta corrida pudo no inspeccionar, así que esa resta compararía
 * universos distintos. La transición es por URL, y por eso sí significa algo.
 */
function summaryTransitions(previous: readonly ClassifiedRow[], rows: readonly ClassifiedRow[]): string[] {
	const seen = observed(rows);
	const { transitions, added } = diffStates(previous, seen);
	const lines = ['', `### Movimiento contra las ${previous.length} URL(s) conocidas`];

	lines.push(
		...(transitions.length === 0
			? ['', '_Sin cambios de estado._']
			: markdownTable(['Movimiento', 'URLs'], countByLabel(transitions, stateMoveLabel))),
	);

	const coverageMoves = diffCoverageStates(previous, seen);
	if (coverageMoves.length > 0) {
		lines.push('', '#### Movimientos de coverageState');
		lines.push(...markdownTable(['Movimiento', 'URLs'], countByLabel(coverageMoves, coverageMoveLabel)));
	}

	const inspected = new Set(seen.map((row) => row.url));
	const skipped = previous.filter((row) => !inspected.has(row.url)).length;
	lines.push('');
	if (added.length > 0) {
		lines.push(`- ${added.length} URL(s) inspeccionadas por primera vez`);
	}
	if (skipped > 0) {
		lines.push(`- ${skipped} URL(s) del historial NO se inspeccionaron en esta corrida`);
	}
	return lines;
}

/**
 * Describe una falla por su status y no por su prosa. El resumen de una corrida programada es
 * público, y el mensaje que devuelve el cliente de Google ante un 401/403 puede arrastrar el
 * `client_email` de la service account: información de reconocimiento que nadie decidió publicar.
 * El status ya dice lo accionable, y el texto completo sigue estando en el log para diagnosticar.
 *
 * Cuando no hay status no queda otra que el mensaje —una falla de red no trae ninguno—, acotado a
 * lo que alcanza para reconocerla.
 */
function failureLabel(row: ClassifiedRow): string {
	const UNTYPED_MESSAGE_LIMIT = 60;
	if (row.errorStatus !== undefined) {
		return `HTTP ${row.errorStatus}`;
	}
	const message = row.error ?? '';
	return message.length > UNTYPED_MESSAGE_LIMIT ? `${message.slice(0, UNTYPED_MESSAGE_LIMIT)}…` : message;
}

function summaryDetails(title: string, items: readonly string[]): string[] {
	if (items.length === 0) {
		return [];
	}
	const shown = items.slice(0, SUMMARY_DETAIL_LIMIT);
	const rest = items.length - shown.length;
	const lines = ['', `### ${title} (${items.length})`, '', ...shown.map((item) => `- ${item}`)];
	return rest > 0 ? [...lines, `- …y ${rest} más`] : lines;
}

/**
 * Variante Markdown del reporte, para el resumen de la página de la corrida. Convive con
 * `formatReport` en vez de reemplazarlo porque responden a lecturas distintas: el log se lee entero
 * cuando algo anda mal, y el resumen tiene que caber en una pantalla o nadie lo mira. De ahí que los
 * detalles largos se acoten acá y no allá.
 */
export function formatSummaryMarkdown({ rows, previous, retries, checkedAt }: SummaryInput): string[] {
	const mismatches = rows.filter((row) => row.canonicalMismatch);
	const failures = rows.filter((row) => row.state === CRAWL_STATE.failed);

	const lines = [
		'## Estado de indexado',
		'',
		`${rows.length} URL(s) inspeccionadas el ${checkedAt}.`,
		...summaryStates(rows),
		...(previous ? summaryTransitions(previous, rows) : []),
		...summaryDetails(
			'Canónica distinta de la declarada',
			mismatches.map((row) => `\`${row.url}\` — Google eligió \`${row.googleCanonical}\``),
		),
		...summaryDetails(
			'Inspecciones fallidas',
			failures.map((row) => `\`${row.url}\` — ${failureLabel(row)}${formatAttempts(row.attempts)}`),
		),
	];

	if (retries !== undefined && retries > 0) {
		lines.push('', `Reintentos consumidos: ${retries}`);
	}
	return lines;
}
