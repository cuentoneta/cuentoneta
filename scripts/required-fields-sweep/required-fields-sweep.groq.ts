import type { RequiredFieldPath } from './required-fields-sweep.schema';

// Traduce cada campo requerido a la consulta que cuenta los documentos que no lo cumplen.

export interface FieldCountQuery {
	readonly documentType: string;
	/** El path tal como se muestra en el reporte. */
	readonly label: string;
	readonly publishedQuery: string;
	readonly draftsQuery: string;
}

// El borrador se distingue por su `_id`, no por la perspectiva: `drafts` cae al documento publicado
// cuando no existe borrador, así que contar con ella reportaría como borradores a los publicados.
const DRAFT_PATH = '_id in path("drafts.**")';

// Un atributo anidado solo se puede exigir si su padre existe: sin el guard, un documento sin el
// objeto contenedor entero se contaría como incumplimiento de cada uno de sus campos, y el reporte
// diría que faltan cinco datos donde falta uno.
function missingPredicate(segments: readonly string[]): string {
	const path = segments.join('.');
	const parents = segments.slice(0, -1);
	if (parents.length === 0) {
		return `!defined(${path})`;
	}
	return `defined(${parents.join('.')}) && !defined(${path})`;
}

// Dentro de un array, el incumplimiento es de al menos un elemento, no del documento: se cuenta el
// documento que tiene alguno.
function missingInArrayPredicate(segments: readonly string[]): string {
	const [arrayPath, ...rest] = segments;
	return `count(${arrayPath}[!defined(${rest.join('.')})]) > 0`;
}

// El nombre de tipo y los segmentos se interpolan en el texto de la query, no viajan como parámetro:
// GROQ no admite parametrizar un identificador. El insumo es un archivo versionado, así que no hay
// input de usuario en juego, pero un schema corrupto tiene que fallar acá y con su nombre a la vista,
// en vez de producir una query mal formada que cuente cualquier otra cosa.
const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

function assertIdentifier(value: string, kind: string): string {
	if (!IDENTIFIER.test(value)) {
		throw new Error(`${kind} inesperado en el schema: "${value}"`);
	}
	return value;
}

export function buildFieldCountQuery(field: RequiredFieldPath): FieldCountQuery {
	assertIdentifier(field.documentType, 'tipo de documento');
	field.segments.forEach((segment) => assertIdentifier(segment, 'nombre de campo'));

	const predicate = field.insideArray ? missingInArrayPredicate(field.segments) : missingPredicate(field.segments);
	const of = (scope: string) => `count(*[_type == "${field.documentType}" && ${scope} && ${predicate}])`;

	return {
		documentType: field.documentType,
		label: `${field.documentType}.${field.segments.join('.')}`,
		publishedQuery: of(`!(${DRAFT_PATH})`),
		draftsQuery: of(DRAFT_PATH),
	};
}

export function buildFieldCountQueries(fields: readonly RequiredFieldPath[]): FieldCountQuery[] {
	return fields.map(buildFieldCountQuery);
}
