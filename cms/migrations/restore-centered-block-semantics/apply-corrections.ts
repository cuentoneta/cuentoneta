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

const QUOTE_PREFIX = '> ';

/** Se lanza ante un cuerpo del que no se puede derivar la corrección. Detiene la corrida. */
export class UncorrectableLiteraryWorkError extends Error {
	constructor(message: string, correctionId?: string) {
		super(correctionId ? `${message} (corrección "${correctionId}")` : message);
		this.name = 'UncorrectableLiteraryWorkError';
	}
}

// Avanza de a un carácter y no por `split`, que cuenta 1 ante dos ocurrencias solapadas: dos líneas
// ancla consecutivas comparten el salto que las separa, y ésa es justamente la ambigüedad a detectar.
function countOccurrences(haystack: string, needle: string): number {
	let count = 0;
	for (let at = haystack.indexOf(needle); at !== -1; at = haystack.indexOf(needle, at + 1)) {
		count += 1;
	}
	return count;
}

/** Cita un tramo preservándolo verbatim: sin reflow ni reescapes, que reescribirían la obra. */
function quote(text: string): string {
	return text
		.split('\n')
		.map((line) => (line === '' ? '>' : `${QUOTE_PREFIX}${line}`))
		.join('\n');
}

function applyReplaceLiteral(body: string, search: string, replacement: string, id: string): CorrectionResult {
	// Un reemplazo que contiene al buscado vuelve a coincidir en la segunda corrida, así que se
	// aplicaría de nuevo y la idempotencia dejaría de valer. Es un error de la tabla, no del documento,
	// y conviene que salte en el ensayo y no cuando alguien lea el contador.
	if (replacement.includes(search)) {
		throw new UncorrectableLiteraryWorkError(
			'El texto de reemplazo contiene al buscado, así que no sería idempotente',
			id,
		);
	}

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
	const RULE_BLOCK = '\n\n---\n\n';
	// El ancla se busca como **línea completa**, no como subcadena: si el mismo texto aparece embebido
	// en un párrafo, tomarlo por posición citaría ese párrafo y borraría los cortes de escena que lo
	// rodean, dejando intacto el pasaje que había que corregir. Por eso se cuenta y se localiza con el
	// mismo patrón.
	const anchorLine = `\n${anchor}\n`;
	const bare = countOccurrences(body, anchorLine);
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
	const anchorAt = body.indexOf(anchorLine) + 1;
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
