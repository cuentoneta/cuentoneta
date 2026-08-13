/**
 * Motor puro de la migración: aplica una corrección editorial al cuerpo Markdown de una sección.
 *
 * Sin I/O ni cliente de Sanity, para poder testearlo sin red ni credenciales. La migración le delega
 * la transformación y se queda con la mutación.
 *
 * Distingue **tres** resultados, y esa distinción es el punto: la idempotencia exige que una segunda
 * corrida no vuelva a tocar nada, y el fail-fast exige que un texto que ya no coincide detenga la
 * corrida. Confundir "ya está aplicada" con "no la encuentro" haría que una edición hecha en el
 * Studio entre el relevamiento y la corrida pasara inadvertida.
 *
 * Que no aparezca no se decide acá: una corrección vive en una sola sección, así que ausente en ésta
 * puede ser presente en la siguiente. Quien tiene el documento entero a la vista es quien puede
 * concluir que falta, y por eso `absent` se devuelve en vez de lanzarse.
 */
import { CORRECTION_KINDS, type Correction } from './corrections';

export const CORRECTION_STATUSES = Object.freeze({
	applied: 'applied',
	already: 'already',
	absent: 'absent',
} as const);

export type CorrectionStatus = (typeof CORRECTION_STATUSES)[keyof typeof CORRECTION_STATUSES];

export interface CorrectionResult {
	status: CorrectionStatus;
	body: string;
}

export interface SectionCorrectionsResult {
	body: string;
	statuses: Readonly<Record<string, CorrectionStatus>>;
}

const RULE_BLOCK = '\n\n---\n\n';
const QUOTE_PREFIX = '> ';

/** Se lanza ante un cuerpo del que no se puede derivar la corrección. Detiene la corrida. */
export class UncorrectableLiteraryWorkError extends Error {
	constructor(message: string, correctionId: string) {
		super(`${message} (corrección "${correctionId}")`);
		this.name = 'UncorrectableLiteraryWorkError';
	}
}

function countOccurrences(haystack: string, needle: string): number {
	return haystack.split(needle).length - 1;
}

/** Cita un tramo preservándolo verbatim: sin reflow ni reescapes, que reescribirían la obra. */
function quote(text: string): string {
	return text
		.split('\n')
		.map((line) => (line === '' ? '>' : `${QUOTE_PREFIX}${line}`))
		.join('\n');
}

function applyReplaceLiteral(body: string, search: string, replacement: string, id: string): CorrectionResult {
	const found = countOccurrences(body, search);
	if (found > 1) {
		throw new UncorrectableLiteraryWorkError(`El texto buscado aparece ${found} veces`, id);
	}
	if (found === 1) {
		return { status: CORRECTION_STATUSES.applied, body: body.replace(search, replacement) };
	}

	const alreadyThere = countOccurrences(body, replacement);
	if (alreadyThere > 1) {
		throw new UncorrectableLiteraryWorkError(`El texto ya corregido aparece ${alreadyThere} veces`, id);
	}
	return alreadyThere === 1
		? { status: CORRECTION_STATUSES.already, body }
		: { status: CORRECTION_STATUSES.absent, body };
}

/**
 * Reemplaza el tramo entre las dos reglas **contiguas al ancla** por ese mismo tramo citado. Mirar
 * solo esas dos es lo que deja intactos los separadores de escena reales del resto del cuerpo, que
 * son la misma construcción y no deben tocarse.
 */
function applyQuoteRuledBlock(body: string, anchor: string, id: string): CorrectionResult {
	const bare = countOccurrences(body, `\n${anchor}\n`);
	const quoted = countOccurrences(body, `\n${QUOTE_PREFIX}${anchor}\n`);
	if (bare + quoted > 1) {
		throw new UncorrectableLiteraryWorkError(`El ancla aparece ${bare + quoted} veces`, id);
	}
	if (quoted === 1) {
		return { status: CORRECTION_STATUSES.already, body };
	}
	if (bare === 0) {
		return { status: CORRECTION_STATUSES.absent, body };
	}

	// El ancla está pero el marco no: es una inconsistencia del documento, no una ausencia. Lanza acá
	// porque ninguna otra sección puede desmentirla.
	const anchorAt = body.indexOf(anchor);
	const openingAt = body.lastIndexOf(RULE_BLOCK, anchorAt);
	const closingAt = body.indexOf(RULE_BLOCK, anchorAt);
	if (openingAt === -1 || closingAt === -1) {
		throw new UncorrectableLiteraryWorkError('El ancla no está enmarcada por dos reglas horizontales', id);
	}

	const inner = body.slice(openingAt + RULE_BLOCK.length, closingAt);
	const head = body.slice(0, openingAt);
	const tail = body.slice(closingAt + RULE_BLOCK.length);
	return { status: CORRECTION_STATUSES.applied, body: `${head}\n\n${quote(inner)}\n\n${tail}` };
}

export function applyCorrection(body: string, correction: Correction): CorrectionResult {
	if (correction.kind === CORRECTION_KINDS.replaceLiteral) {
		return applyReplaceLiteral(body, correction.search, correction.replacement, correction.id);
	}
	return applyQuoteRuledBlock(body, correction.anchor, correction.id);
}

/** Pliega las correcciones sobre un cuerpo, devolviendo el resultado y el estado de cada una. */
export function applySectionCorrections(body: string, corrections: readonly Correction[]): SectionCorrectionsResult {
	const statuses: Record<string, CorrectionStatus> = {};
	const corrected = corrections.reduce((current, correction) => {
		const result = applyCorrection(current, correction);
		statuses[correction.id] = result.status;
		return result.body;
	}, body);

	return { body: corrected, statuses };
}
