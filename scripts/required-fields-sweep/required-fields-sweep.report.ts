import type { UncoveredPath } from './required-fields-sweep.schema';

// Presentación del barrido y decisión sobre su issue de seguimiento. Mismo contrato que el sweep de
// menciones a issues: read-only por defecto, idempotente por una huella embebida, y nunca cierra.

const FINGERPRINT_PREFIX = '<!-- huella:';

/** Cuántos documentos incumplen un campo requerido, por perspectiva. */
export interface FieldBreach {
	readonly label: string;
	readonly published: number;
	readonly drafts: number;
}

export interface SweepReport {
	readonly breaches: readonly FieldBreach[];
	readonly uncovered: readonly UncoveredPath[];
	readonly scannedFields: number;
}

export type SweepAction =
	| { readonly kind: 'noop' }
	| { readonly kind: 'create'; readonly body: string }
	| { readonly kind: 'update'; readonly body: string }
	| { readonly kind: 'resolved'; readonly body: string; readonly comment: string };

/** Solo los campos con al menos un incumplimiento, del más extendido al menos. */
export function breachesOf(counts: readonly FieldBreach[]): FieldBreach[] {
	return counts
		.filter((breach) => breach.published > 0 || breach.drafts > 0)
		.sort((a, b) => b.published - a.published || b.drafts - a.drafts || a.label.localeCompare(b.label));
}

/**
 * Cadena determinista del conjunto de hallazgos. Es lo que vuelve idempotente al job: mismo conjunto
 * ⇒ misma huella ⇒ no se escribe nada.
 */
export function fingerprint(breaches: readonly FieldBreach[]): string {
	// Sin los conteos a propósito: que una obra nueva sume un incumplimiento al mismo campo no es un
	// hallazgo distinto, y reescribiría el seguimiento cada semana sin que nada haya cambiado.
	return [...new Set(breaches.map((breach) => breach.label))].sort().join('|');
}

function breachRows(breaches: readonly FieldBreach[]): string[] {
	return breaches.map((breach) => `| \`${breach.label}\` | ${breach.published} | ${breach.drafts} |`);
}

export function formatReportBody(report: SweepReport): string {
	const uncoveredSection =
		report.uncovered.length === 0
			? []
			: [
					'',
					'### Fuera de la cobertura del barrido',
					'',
					'Estos paths no se pueden contar sin ramificar por el tipo de cada miembro, así que el barrido no los mide:',
					'',
					...report.uncovered.map((path) => `- \`${path.documentType}.${path.segments.join('.')}\` — ${path.reason}`),
				];

	return [
		'Los siguientes campos se declaran requeridos en el schema, pero hay documentos persistidos que no los cumplen.',
		'',
		'`Rule.required()` gobierna la **edición** en el Studio, no el almacenamiento: un documento anterior a la regla, o escrito por script o migración, la esquiva sin dejar señal. El typegen deriva la nulabilidad del schema declarado, así que emite un tipo no-nullable en el que el mapper confía.',
		'',
		'Qué hacer con cada uno se decide **por campo**, no globalmente: si existe un valor por defecto honesto va como `coalesce` en la query; si no existe, el borde descarta el dato accesorio o falla ante el central. Nunca se fabrica un valor.',
		'',
		'| Campo | Publicados | Borradores |',
		'| --- | ---: | ---: |',
		...breachRows(report.breaches),
		...uncoveredSection,
		'',
		`${FINGERPRINT_PREFIX} ${fingerprint(report.breaches)} -->`,
	].join('\n');
}

/**
 * Qué hacer con el issue de seguimiento. Nunca lo cierra solo: que un campo deje de incumplirse no
 * significa que alguien lo haya atendido — puede haberse borrado el documento que lo exponía.
 */
export function decideAction(input: { report: SweepReport; existing: { body: string } | null }): SweepAction {
	const { report, existing } = input;

	if (report.breaches.length === 0) {
		// El aviso de resolución se da una sola vez: la huella es la marca de que el seguimiento todavía
		// reporta hallazgos, y al avisar se la quita.
		if (existing === null || !existing.body.includes(FINGERPRINT_PREFIX)) {
			return { kind: 'noop' };
		}
		return {
			kind: 'resolved',
			body: existing.body.replace(new RegExp(`${FINGERPRINT_PREFIX}[^>]*-->`), '<!-- resuelto -->'),
			comment: 'Ya no quedan campos requeridos incumplidos. Se puede cerrar este seguimiento.',
		};
	}

	const body = formatReportBody(report);
	if (existing === null) {
		return { kind: 'create', body };
	}
	return existing.body.includes(`${FINGERPRINT_PREFIX} ${fingerprint(report.breaches)} -->`)
		? { kind: 'noop' }
		: { kind: 'update', body };
}

/** La salida compacta de una corrida read-only: es lo que se lee en la consola del job. */
export function formatConsoleReport(report: SweepReport): string {
	if (report.breaches.length === 0) {
		return `campos requeridos: ${report.scannedFields} verificados · ninguno incumplido.`;
	}

	const lines = report.breaches.map(
		(breach) => `  ${breach.label} — ${breach.published} publicados, ${breach.drafts} borradores`,
	);
	const uncovered =
		report.uncovered.length === 0
			? []
			: [
					`  (${report.uncovered.length} fuera de la cobertura: ${report.uncovered
						.map((path) => `${path.documentType}.${path.segments.join('.')}`)
						.join(', ')})`,
				];

	return [
		`campos requeridos: ${report.scannedFields} verificados · ${report.breaches.length} incumplidos.`,
		...lines,
		...uncovered,
	].join('\n');
}
