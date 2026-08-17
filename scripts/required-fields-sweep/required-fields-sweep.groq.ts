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
//
// Dentro del filtro, el resto del path se resuelve contra cada ítem, así que un objeto anidado
// (`tabs[!defined(slug.current)]`) se expresa igual de bien. Lo que este predicado no sabe expresar es
// un **segundo** array, y de eso se ocupa el recorrido del schema, que lo declara como no cubierto en
// vez de emitir una consulta que contaría mal en silencio.
function missingInArrayPredicate(segments: readonly string[]): string {
	const [arrayPath, ...rest] = segments;
	// El mismo guard que la rama de arriba, aplicado dentro del ítem: sin él, un elemento que no trae
	// el objeto contenedor entero se cuenta una vez por cada campo de ese objeto, y el reporte dice
	// que faltan varios datos donde falta uno.
	const parents = rest.slice(0, -1);
	const missing =
		parents.length === 0 ? `!defined(${rest[0]})` : `defined(${parents.join('.')}) && !defined(${rest.join('.')})`;
	return `count(${arrayPath}[${missing}]) > 0`;
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
