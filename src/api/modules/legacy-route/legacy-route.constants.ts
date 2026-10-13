/**
 * Prefijo del `_id` de cada documento migrado, por tipo de origen: el `_id` del migrado es este prefijo
 * seguido del `_id` del documento del que proviene.
 *
 * Es la única huella de la procedencia en el dataset —ningún campo ni referencia la registra—, así que
 * las rutas viejas, que nombran el slug del origen, llegan al migrado reconstruyendo ese `_id`.
 */
export const MIGRATED_ID_PREFIX = Object.freeze({
	story: 'lw-from-story-',
	storylist: 'collection-from-storylist-',
} as const);
