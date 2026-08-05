import { defineMigration, del } from 'sanity/migrate';

import { isMigratedLiteraryWorkId, MIGRATED_ID_PREFIX } from '../story-to-literary-work/build-literary-work-document';

interface LiteraryWorkDocument {
	_id: string;
}

/**
 * Deshace la creación de obras a partir de cuentos: borra únicamente las que nacieron de una
 * migración, reconocidas por el prefijo de su `_id`.
 *
 * **El predicado se importa, no se reescribe.** Si esta migración tuviera su propia noción de qué es
 * una obra migrada, una divergencia entre ambas definiciones podría borrar una obra creada a mano en
 * el Studio. Con la fuente compartida, cambiar el esquema del `_id` mueve las dos a la vez.
 *
 * El filtro de GROQ acota el recorrido y el guard vuelve a comprobarlo sobre cada documento: el filtro
 * es una optimización del runner, no la garantía. Una invocación con otro filtro —o un cambio futuro
 * en el runner— no debe alcanzar para borrar una obra que no creó esta migración.
 *
 * El filtro usa `string::startsWith` y no `match`: el `match` de GROQ compara **por tokens**, así que
 * un `"prefijo-*"` es más ancho de lo que aparenta y deja pasar ids que no arrancan con el prefijo.
 *
 * No restaura nada en los cuentos porque la migración de ida no los tocó: solo creó documentos al lado.
 */
export default defineMigration({
	title: 'Revertir la creación de obras a partir de cuentos',
	documentTypes: ['literaryWork'],
	filter: `string::startsWith(_id, "${MIGRATED_ID_PREFIX}")`,
	migrate: {
		document(doc: LiteraryWorkDocument) {
			if (!isMigratedLiteraryWorkId(doc._id)) {
				return [];
			}
			return [del(doc._id)];
		},
	},
});
