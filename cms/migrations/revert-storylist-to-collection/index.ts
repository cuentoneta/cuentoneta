import { defineMigration, del } from 'sanity/migrate';

import { DRAFTS_PATH_PREFIX } from '../story-to-literary-work/build-literary-work-document';
import { isMigratedCollectionId, MIGRATED_ID_PREFIX } from '../storylist-to-collection/build-collection-document';

interface CollectionDocument {
	_id: string;
}

/**
 * Deshace la creación de colecciones a partir de storylists, en sus **dos** formas: las publicadas y
 * las que nacieron de un borrador. Es el mazazo; para reintentar solo el lote de borradores está la
 * reversión acotada, que no se lleva puesto el corpus publicado.
 *
 * **El predicado se importa, no se reescribe.** Una segunda noción de "colección migrada" podría
 * divergir y borrar una colección creada a mano en el Studio.
 *
 * **El filtro enumera las dos formas** porque el prefijo de path antecede al de la migración y GROQ no
 * ofrece recortarlo dentro del filtro. Usa `string::startsWith` y no `match`: el `match` de GROQ compara
 * por tokens, así que un patrón con comodín es más ancho de lo que aparenta.
 *
 * El guard revalida sobre cada documento porque el filtro es una optimización del runner, no la
 * garantía.
 *
 * No restaura nada en las storylists, porque la migración de ida no las tocó.
 */
export default defineMigration({
	title: 'Revertir la creación de colecciones a partir de storylists',
	documentTypes: ['collection'],
	filter: `string::startsWith(_id, "${MIGRATED_ID_PREFIX}") || string::startsWith(_id, "${DRAFTS_PATH_PREFIX}${MIGRATED_ID_PREFIX}")`,
	migrate: {
		document(doc: CollectionDocument) {
			return isMigratedCollectionId(doc._id) ? [del(doc._id)] : [];
		},
	},
});
