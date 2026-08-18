/**
 * Presentación del barrido y decisión sobre su issue de seguimiento.
 *
 * Mismo contrato que los otros dos sweeps del repo: read-only por defecto, idempotente por una huella
 * embebida en el cuerpo, y nunca cierra el issue solo.
 */
import type { PageResult } from './seo-body-sweep.helpers';
import { emptyPathsOf, unmeasuredOf } from './seo-body-sweep.helpers';

const FINGERPRINT_PREFIX = '<!-- huella:';

export interface SweepReport {
	readonly emptyPaths: readonly string[];
	readonly unmeasured: readonly { readonly path: string; readonly reason: string }[];
	readonly scanned: number;
}

export type SweepAction =
	| { readonly kind: 'noop' }
	| { readonly kind: 'create'; readonly body: string }
	| { readonly kind: 'update'; readonly body: string }
	| { readonly kind: 'resolved'; readonly body: string; readonly comment: string };

export function buildReport(results: readonly PageResult[]): SweepReport {
	return {
		emptyPaths: emptyPathsOf(results).sort(),
		unmeasured: unmeasuredOf(results).sort((a, b) => a.path.localeCompare(b.path)),
		scanned: results.length,
	};
}

/**
 * Cadena determinista del conjunto de páginas vacías. Es lo que vuelve idempotente al job: mismo
 * conjunto ⇒ misma huella ⇒ no se escribe nada.
 *
 * Las páginas no medidas quedan fuera a propósito. Son transitorias por definición: un 503 distinto
 * cada semana reescribiría el seguimiento sin que ningún defecto haya cambiado.
 */
export function fingerprint(emptyPaths: readonly string[]): string {
	return [...new Set(emptyPaths)].sort().join('|');
}

/**
 * Las rutas que el seguimiento venía reportando, leídas de su propia huella. Es la única copia que
 * queda cuando el hallazgo se resuelve, así que se recupera de ahí y no de la corrida actual —que por
 * definición ya no las tiene—.
 */
export function previouslyReportedPaths(body: string): string[] {
	const marker = body.match(/<!-- huella: (.*?) -->/);
	return marker?.[1] ? marker[1].split('|').filter(Boolean) : [];
}

/** Agrupa por el primer segmento de la ruta, que es lo que distingue tipo de página. */
export function groupByPrefix(paths: readonly string[]): { prefix: string; paths: string[] }[] {
	const groups = new Map<string, string[]>();
	for (const path of paths) {
		const prefix = `/${path.split('/').filter(Boolean)[0] ?? ''}`;
		groups.set(prefix, [...(groups.get(prefix) ?? []), path]);
	}
	return [...groups.entries()]
		.map(([prefix, grouped]) => ({ prefix, paths: grouped.sort() }))
		.sort((a, b) => b.paths.length - a.paths.length || a.prefix.localeCompare(b.prefix));
}

function unmeasuredSection(report: SweepReport): string[] {
	if (report.unmeasured.length === 0) {
		return [];
	}
	return [
		'',
		'### Sin medir',
		'',
		'Estas URLs agotaron sus reintentos, así que el barrido no pudo afirmar nada sobre su cuerpo. **No** cuentan como páginas vacías, y no entran a la huella de este seguimiento.',
		'',
		...report.unmeasured.map((entry) => `- \`${entry.path}\` — ${entry.reason}`),
	];
}

export function formatReportBody(report: SweepReport): string {
	const groups = groupByPrefix(report.emptyPaths);
	return [
		`El barrido recorrió ${report.scanned} URLs del sitemap y encontró **${report.emptyPaths.length}** que responden 200 con un cuerpo vacío.`,
		'',
		'Una página sin cuerpo es un defecto sin importar de qué tipo sea: se sirve a los crawlers como si tuviera contenido, y lo que ven es un cascarón. El barrido afirma un solo invariante —que `<main>` trae texto y no un skeleton— justamente para poder afirmarlo sobre todas.',
		'',
		...groups.flatMap(({ prefix, paths }) => [
			`### \`${prefix}\` (${paths.length})`,
			'',
			...paths.map((path) => `- \`${path}\``),
			'',
		]),
		...unmeasuredSection(report),
		'',
		`${FINGERPRINT_PREFIX} ${fingerprint(report.emptyPaths)} -->`,
	].join('\n');
}

/**
 * Qué hacer con el issue de seguimiento. Nunca lo cierra solo: que una página deje de estar vacía no
 * significa que alguien la haya atendido — puede haberse caído del sitemap.
 */
export function decideAction(input: { report: SweepReport; existing: { body: string } | null }): SweepAction {
	const { report, existing } = input;

	if (report.emptyPaths.length === 0) {
		// El aviso de resolución se da una sola vez: la huella es la marca de que el seguimiento todavía
		// reporta hallazgos, y al avisar se la quita.
		if (existing === null || !existing.body.includes(FINGERPRINT_PREFIX)) {
			return { kind: 'noop' };
		}
		// El cuerpo se reescribe entero —conservar la lista dejaría al issue afirmando que esas páginas
		// están vacías, justo debajo del aviso de que ya no—, pero la lista se conserva como registro:
		// el seguimiento sobrevive abierto hasta que alguien lo cierre, y sin ella quien lo lea después
		// no puede saber qué se había roto.
		return {
			kind: 'resolved',
			body: [
				'Ninguna URL del sitemap sirve un cuerpo vacío.',
				'',
				'### Lo que este seguimiento reportaba',
				'',
				...previouslyReportedPaths(existing.body).map((path) => `- \`${path}\``),
				'',
				'<!-- resuelto -->',
			].join('\n'),
			comment: 'El barrido ya no encuentra páginas con cuerpo vacío. Se puede cerrar este seguimiento.',
		};
	}

	const body = formatReportBody(report);
	if (existing === null) {
		return { kind: 'create', body };
	}
	return existing.body.includes(`${FINGERPRINT_PREFIX} ${fingerprint(report.emptyPaths)} -->`)
		? { kind: 'noop' }
		: { kind: 'update', body };
}

/**
 * La salida de la corrida: es lo que se lee en la consola del job y en local.
 *
 * Hasta `MAX_LISTED` hallazgos lista las rutas, porque de un puñado lo que se quiere es ir a mirarlas;
 * de ahí en más agrupa por tipo, que es lo que se quiere de una regresión extendida.
 */
export function formatConsoleReport(report: SweepReport): string {
	const MAX_LISTED = 10;
	const unmeasured = report.unmeasured.length === 0 ? '' : ` · ${report.unmeasured.length} sin medir`;
	if (report.emptyPaths.length === 0) {
		return `barrido de cuerpos: ${report.scanned} URLs · ninguna vacía${unmeasured}.`;
	}
	const detail =
		report.emptyPaths.length <= MAX_LISTED
			? report.emptyPaths.map((path) => `  ${path}`)
			: groupByPrefix(report.emptyPaths).map(({ prefix, paths }) => `  ${prefix} — ${paths.length}`);
	return [
		`barrido de cuerpos: ${report.scanned} URLs · ${report.emptyPaths.length} vacías${unmeasured}.`,
		...detail,
	].join('\n');
}

export function formatSummaryMarkdown(report: SweepReport): string {
	const headline =
		report.emptyPaths.length === 0
			? `Barrido de cuerpos: ${report.scanned} URLs, ninguna vacía.`
			: `Barrido de cuerpos: **${report.emptyPaths.length}** de ${report.scanned} URLs sirven un cuerpo vacío.`;
	return [
		'## Barrido de cuerpos',
		'',
		headline,
		...(report.unmeasured.length === 0 ? [] : ['', `${report.unmeasured.length} URLs no se pudieron medir.`]),
		'',
	].join('\n');
}
