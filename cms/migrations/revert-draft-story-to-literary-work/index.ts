import { defineMigration, del } from 'sanity/migrate';

import {
	DRAFTS_PATH_PREFIX,
	isMigratedLiteraryWorkId,
	MIGRATED_ID_PREFIX,
} from '../story-to-literary-work/build-literary-work-document';

interface LiteraryWorkDocument {
	_id: string;
}

/**
 * Deshace **solo** la creación de obras en borrador, dejando intactas las publicadas.
 *
 * `revert-story-to-literary-work` alcanza las dos formas del identificador a la vez, así que usarla
 * para descartar el lote de borradores se llevaría también el corpus publicado. Esta acota el borrado
 * a lo que nace de un cuento en borrador, que es lo que se querría deshacer al reintentar esa corrida.
 *
 * El guard exige **las dos** condiciones y no solo el prefijo de path: un documento cualquiera bajo
 * `drafts.` no es una obra migrada, y el predicado compartido es lo que distingue una de otra.
 *
 * No restaura nada en los cuentos, porque la migración de ida no los tocó.
 */
export default defineMigration({
	title: 'Revertir la creación de obras en borrador a partir de cuentos en borrador',
	documentTypes: ['literaryWork'],
	filter: `string::startsWith(_id, "${DRAFTS_PATH_PREFIX}${MIGRATED_ID_PREFIX}")`,
	migrate: {
		document(doc: LiteraryWorkDocument) {
			if (!doc._id.startsWith(DRAFTS_PATH_PREFIX) || !isMigratedLiteraryWorkId(doc._id)) {
				return [];
			}
			return [del(doc._id)];
		},
	},
});
