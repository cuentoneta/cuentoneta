import { at, defineMigration, set } from 'sanity/migrate';

// El shape mínimo que la migración necesita del documento. No se importan los tipos del typegen porque
// describen el schema **nuevo** (donde el campo ya se llama `description`), y lo que esta migración lee
// es el viejo.
interface RenamableDocument {
	_id: string;
	shortDescription?: unknown;
	description?: unknown;
}

// Un valor en blanco no cuenta como descripción: persistirlo dejaría el documento inválido sin que nada
// lo señale, porque el mapper lo propaga a un contrato declarado `string`.
function hasText(value: unknown): value is string {
	return typeof value === 'string' && value.trim() !== '';
}

/**
 * Copia `shortDescription` a `description` en los tipos que renombran el campo, sin dar de baja el
 * viejo.
 *
 * **Orden de despliegue:** esta migración corre **antes** de desplegar el código que proyecta
 * `description`, y **en cada dataset** (development, staging y production), no una sola vez. Es la mitad
 * no destructiva del rename: los documentos que existían al momento de la corrida quedan con ambos
 * nombres poblados, que es el único estado que las dos versiones del código pueden servir. La baja de
 * `shortDescription` vive en la migración `unset-legacy-short-description` y corre recién con el código
 * nuevo verificado.
 *
 * Queda un residuo que la migración no puede cubrir: un documento **creado** entre el despliegue del
 * schema del Studio y esta corrida nace solo con `description`, así que el código todavía viejo lo lee
 * vacío. Se cierra volviendo a correr la migración justo antes de desplegar la app.
 *
 * Es idempotente: un documento cuya `description` ya tiene contenido no produce mutación, lo que permite
 * reintentar una corrida que se cortó a la mitad.
 */
export default defineMigration({
	title: 'Copiar shortDescription a description en resourceType y tag',
	documentTypes: ['resourceType', 'tag'],
	migrate: {
		document(doc: RenamableDocument) {
			const legacy = hasText(doc.shortDescription) ? doc.shortDescription : undefined;

			// El campo es requerido en ambos schemas, pero eso lo hace cumplir el editor del Studio, no la API:
			// un documento creado por API puede llegar sin ninguna de las dos formas. Sin este aborto quedaría
			// con el campo requerido sin poblar, y nada lo señalaría — el mapper propaga el hueco a un contrato
			// declarado `string` y ninguna superficie lo valida.
			if (!hasText(doc.description) && legacy === undefined) {
				throw new Error(
					`${doc._id} no tiene descripción bajo ninguno de los dos nombres: el campo es requerido y la ` +
						`migración no tiene de dónde copiarla.`,
				);
			}

			// Backfill, no sincronización: el campo nuevo se puebla solo si está vacío. Comparar por igualdad
			// bastaría para reintentar una corrida cortada, pero una corrida tardía —con el schema nuevo ya
			// desplegado— leería una edición legítima como "todavía sin copiar" y la pisaría con el valor viejo.
			if (hasText(doc.description) || legacy === undefined) return [];

			return [at('description', set(legacy))];
		},
	},
});
