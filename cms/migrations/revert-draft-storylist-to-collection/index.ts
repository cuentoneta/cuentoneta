import { defineMigration, del } from 'sanity/migrate';

import { DRAFTS_PATH_PREFIX } from '../story-to-literary-work/build-literary-work-document';
import { isMigratedCollectionId, MIGRATED_ID_PREFIX } from '../storylist-to-collection/build-collection-document';

interface CollectionDocument {
	_id: string;
}

/**
 * Deshace **solo** la creación de colecciones en borrador, dejando intactas las publicadas.
 *
 * `revert-storylist-to-collection` alcanza las dos formas del identificador a la vez, así que usarla
 * para descartar el lote de borradores se llevaría también las colecciones publicadas —que son sobre
 * las que se construye la página nueva, y que pueden haber recibido correcciones editoriales que
 * `createIfNotExists` protege deliberadamente—. Esta es la que se usa de verdad al reintentar.
 *
 * El guard exige **las dos** condiciones y no solo el prefijo de path: un documento cualquiera bajo
 * `drafts.` no es una colección migrada, y el predicado compartido es lo que distingue una de otra.
 *
 * No restaura nada en las storylists, porque la migración de ida no las tocó.
 */
export default defineMigration({
	title: 'Revertir la creación de colecciones en borrador a partir de storylists en borrador',
	documentTypes: ['collection'],
	filter: `string::startsWith(_id, "${DRAFTS_PATH_PREFIX}${MIGRATED_ID_PREFIX}")`,
	migrate: {
		document(doc: CollectionDocument) {
			if (!doc._id.startsWith(DRAFTS_PATH_PREFIX) || !isMigratedCollectionId(doc._id)) {
				return [];
			}
			return [del(doc._id)];
		},
	},
});
