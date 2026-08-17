import type { RequiredFieldPath } from './required-fields-sweep.schema';

// Traduce cada campo requerido a la consulta que cuenta los documentos que no lo cumplen.

export interface FieldCountQuery {
	readonly documentType: string;
	/** El path tal como se muestra en el reporte. */
	readonly label: string;
	readonly query: string;
}

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

export function buildFieldCountQuery(field: RequiredFieldPath): FieldCountQuery {
	const predicate = field.insideArray ? missingInArrayPredicate(field.segments) : missingPredicate(field.segments);

	return {
		documentType: field.documentType,
		label: `${field.documentType}.${field.segments.join('.')}`,
		query: `count(*[_type == "${field.documentType}" && ${predicate}])`,
	};
}

export function buildFieldCountQueries(fields: readonly RequiredFieldPath[]): FieldCountQuery[] {
	return fields.map(buildFieldCountQuery);
}
