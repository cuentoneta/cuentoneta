import { FIELD_SHAPES, type WatchedField } from './field-shape-sweep.fields';

// Traduce cada campo vigilado a la consulta que cuenta los documentos cuyo valor no tiene la forma
// que el schema declara.

export interface ShapeCountQuery {
	/** El path tal como se muestra en el reporte. */
	readonly label: string;
	readonly publishedQuery: string;
	readonly draftsQuery: string;
}

// El borrador se distingue por su `_id`, no por la perspectiva: `drafts` cae al documento publicado
// cuando no existe borrador, así que contar con ella reportaría como borradores a los publicados.
const DRAFT_PATH = '_id in path("drafts.**")';

// El nombre de tipo y el path se interpolan en el texto de la query, no viajan como parámetro: GROQ
// no admite parametrizar un identificador. El insumo es una tabla versionada, pero una entrada mal
// escrita tiene que fallar acá y con su nombre a la vista, en vez de producir una query mal formada
// que cuente cualquier otra cosa.
const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)*$/;

function assertIdentifier(value: string, kind: string): string {
	if (!IDENTIFIER.test(value)) {
		throw new Error(`${kind} inesperado en la tabla de campos vigilados: "${value}"`);
	}
	return value;
}

// El campo ausente no es una forma inválida: lo cubre el barrido de campos requeridos, y contarlo acá
// duplicaría el mismo hallazgo en dos reportes que se atienden distinto.
function malformedPredicate(field: WatchedField): string {
	if (field.shape === FIELD_SHAPES.dateTime) {
		return `defined(${field.path}) && !(${field.path} match "*T*")`;
	}
	throw new Error(`Forma sin predicado: "${field.shape}"`);
}

export function buildShapeCountQuery(field: WatchedField): ShapeCountQuery {
	assertIdentifier(field.documentType, 'tipo de documento');
	assertIdentifier(field.path, 'path de campo');

	const predicate = malformedPredicate(field);
	const of = (scope: string) => `count(*[_type == "${field.documentType}" && ${scope} && ${predicate}])`;

	return {
		label: `${field.documentType}.${field.path}`,
		publishedQuery: of(`!(${DRAFT_PATH})`),
		draftsQuery: of(DRAFT_PATH),
	};
}

export function buildShapeCountQueries(fields: readonly WatchedField[]): ShapeCountQuery[] {
	return fields.map(buildShapeCountQuery);
}
