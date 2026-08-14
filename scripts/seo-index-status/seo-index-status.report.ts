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
