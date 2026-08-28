/**
 * Los campos cuyo **formato** se vigila, con la forma que su schema declara.
 *
 * La tabla va a mano y no derivada del schema versionado, a diferencia del barrido de campos
 * requeridos: `cms/schema.json` colapsa `datetime` a `{"type":"string"}`, así que el archivo no
 * distingue una fecha con hora de cualquier otra cadena. Lo que se pierde con eso es la cobertura
 * automática — un campo `datetime` nuevo no entra solo, hay que sumarlo acá.
 */

/** Formas verificables. `datetime` exige el instante completo, que es lo que el dominio construye. */
export const FIELD_SHAPES = Object.freeze({ dateTime: 'dateTime' } as const);
export type FieldShape = (typeof FIELD_SHAPES)[keyof typeof FIELD_SHAPES];

export interface WatchedField {
	readonly documentType: string;
	readonly path: string;
	readonly shape: FieldShape;
}

export const WATCHED_FIELDS: readonly WatchedField[] = Object.freeze([
	{ documentType: 'literaryWork', path: 'publishedAt', shape: FIELD_SHAPES.dateTime },
	{ documentType: 'story', path: 'publishedAt', shape: FIELD_SHAPES.dateTime },
] satisfies readonly WatchedField[]);
