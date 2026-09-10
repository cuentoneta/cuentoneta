// Presentación del barrido y decisión sobre su issue de seguimiento. Mismo contrato que los otros
// barridos programados: read-only por defecto, idempotente por una huella embebida, y nunca cierra.

const FINGERPRINT_PREFIX = '<!-- huella:';

/** Cuántos documentos guardan el campo con una forma que su schema no declara, por perspectiva. */
export interface ShapeBreach {
	readonly label: string;
	readonly published: number;
	readonly drafts: number;
}

export interface SweepReport {
	readonly breaches: readonly ShapeBreach[];
	readonly scannedFields: number;
}

export type SweepAction =
	| { readonly kind: 'noop' }
	| { readonly kind: 'create'; readonly body: string }
	| { readonly kind: 'update'; readonly body: string }
	| { readonly kind: 'resolved'; readonly body: string; readonly comment: string };

/** Solo los campos con al menos un documento malformado, del más extendido al menos. */
export function breachesOf(counts: readonly ShapeBreach[]): ShapeBreach[] {
	return counts
		.filter((breach) => breach.published > 0 || breach.drafts > 0)
		.sort((a, b) => b.published - a.published || b.drafts - a.drafts || a.label.localeCompare(b.label));
}

/**
 * Cadena determinista del conjunto de hallazgos. Es lo que vuelve idempotente al job: mismo conjunto
 * ⇒ misma huella ⇒ no se escribe nada.
 */
export function fingerprint(breaches: readonly ShapeBreach[]): string {
	// Sin los conteos a propósito: que un documento nuevo sume un incumplimiento al mismo campo no es
	// un hallazgo distinto, y reescribiría el seguimiento cada semana sin que nada haya cambiado.
	return [...new Set(breaches.map((breach) => breach.label))].sort().join('|');
}

export function formatReportBody(report: SweepReport): string {
	const remediation = remediationHints(report.breaches);
	const remediationSection = remediation.length === 0 ? [] : ['', '### Remediación', '', ...remediation];

	return [
		'Los siguientes campos guardan, en algún documento, un valor con una forma que su schema no declara.',
		'',
		'El tipo declarado en el schema gobierna la **edición** en el Studio, no el almacenamiento: un documento anterior al tipo actual, o escrito por script o migración, guarda la forma que le hayan puesto. El typegen deriva de ese tipo declarado, así que el mapper recibe un valor que su value object rechaza y la lectura del documento falla entera.',
		'',
		'Qué hacer se decide **por campo**: normalizar el dato a la forma declarada es lo habitual, y elegir con qué valor se completa es una decisión de contenido. Aflojar el value object para que acepte la forma inválida deja entrar al dominio un dato que el propio schema dice que no debería existir.',
		'',
		'| Campo | Publicados | Borradores |',
		'| --- | ---: | ---: |',
		...report.breaches.map((breach) => `| \`${breach.label}\` | ${breach.published} | ${breach.drafts} |`),
		...remediationSection,
		'',
		`${FINGERPRINT_PREFIX} ${fingerprint(report.breaches)} -->`,
	].join('\n');
}

// La remediación recurrente de cada forma conocida, para que el seguimiento pase de solo reportar
// a indicar cómo remediar. Solo los labels de esta tabla llevan hint: un campo nuevo sin
// remediación asignada se reporta igual, sin prometer una.
const REMEDIATION_BY_LABEL: Readonly<Record<string, string>> = {
	'literaryWork.publishedAt': 'pnpm normalize:bare-published-at --no-dry-run',
};

export function remediationHints(breaches: readonly ShapeBreach[]): string[] {
	return breaches.flatMap((breach) => {
		const command: string | null = REMEDIATION_BY_LABEL[breach.label] ?? null;
		return command === null ? [] : [`\`${breach.label}\` se remedia con \`${command}\` (corrida en seco por defecto).`];
	});
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
		// El cuerpo se reemplaza entero: conservar la tabla dejaría el issue afirmando que esos campos
		// guardan una forma inválida, justo debajo del aviso de que ya no.
		return {
			kind: 'resolved',
			body: 'Ya no quedan campos con una forma que su schema no declare.\n\n<!-- resuelto -->',
			comment: 'Ya no quedan campos con forma inválida. Se puede cerrar este seguimiento.',
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
		return `formas de campo: ${report.scannedFields} verificadas · ninguna incumplida.`;
	}

	return [
		`formas de campo: ${report.scannedFields} verificadas · ${report.breaches.length} incumplidas.`,
		...report.breaches.map(
			(breach) => `  ${breach.label} — ${breach.published} publicados, ${breach.drafts} borradores`,
		),
	].join('\n');
}
