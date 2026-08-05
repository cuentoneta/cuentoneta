import { at, defineMigration, set } from 'sanity/migrate';

// El shape mínimo que la migración necesita del documento. No se importan los tipos del typegen porque
// describen el schema **nuevo** (donde el campo ya se llama `description`), y lo que esta migración lee
// es el viejo.
interface RenamableDocument {
	_id: string;
	shortDescription?: unknown;
	description?: unknown;
}

/**
 * Copia `shortDescription` a `description` en los tipos que renombran el campo, sin dar de baja el
 * viejo.
 *
 * **Orden de despliegue:** esta migración corre **antes** de desplegar el código que proyecta
 * `description`. Es la mitad no destructiva del rename: mientras el campo viejo siga presente, el código
 * ya desplegado lo sigue leyendo, así que no hay ventana en la que alguna superficie sirva la
 * descripción vacía. La baja de `shortDescription` vive en la migración `unset-legacy-short-description`
 * y corre recién con el código nuevo verificado.
 *
 * Es idempotente: un documento cuya `description` ya coincide no produce mutación, lo que permite
 * reintentar una corrida que se cortó a la mitad.
 */
export default defineMigration({
	title: 'Copiar shortDescription a description en resourceType y tag',
	documentTypes: ['resourceType', 'tag'],
	migrate: {
		document(doc: RenamableDocument) {
			if (typeof doc.shortDescription !== 'string') return [];

			// Backfill, no sincronización: el campo nuevo se puebla solo si está vacío. Comparar por igualdad
			// bastaría para reintentar una corrida cortada, pero una corrida tardía —con el schema nuevo ya
			// desplegado— leería una edición legítima como "todavía sin copiar" y la pisaría con el valor viejo.
			if (typeof doc.description === 'string' && doc.description.trim() !== '') return [];

			// El campo es requerido en ambos schemas: persistir un valor en blanco lo dejaría inválido sin
			// que nada lo señale, y el mapper lo propaga a un contrato declarado `string`.
			if (doc.shortDescription.trim() === '') {
				throw new Error(
					`La descripción de ${doc._id} está en blanco: el campo es requerido y copiarla así dejaría el ` +
						`documento inválido al leerlo bajo el nombre nuevo.`,
				);
			}

			return [at('description', set(doc.shortDescription))];
		},
	},
});
