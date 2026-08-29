/** Una referencia dentro de un array de Sanity: la clave la asigna el editor y sobrevive al reapuntado. */
export interface KeyedReference {
	_key: string;
	_type: 'reference';
	_ref: string;
	_weak?: boolean;
	_strengthenOnPublish?: { type: string; template?: { id: string } };
}

type TargetType = 'collection' | 'literaryWork';

/** Sanity marca el borrador de un documento con este prefijo de path en su `_id`. */
const DRAFTS_PATH_PREFIX = 'drafts.';

// Los prefijos con los que se nombró a los documentos creados por migración. Son valores históricos:
// identifican documentos que ya existen en el dataset, así que no pueden cambiar sin dejar de
// reconocerlos.
const MIGRATED_LITERARY_WORK_ID_PREFIX = 'lw-from-story-';
const MIGRATED_COLLECTION_ID_PREFIX = 'collection-from-storylist-';

/**
 * El prefijo de path va **antes** que el de la migración, no concatenado detrás del origen: Sanity lo
 * lee como borrador solo cuando encabeza el `_id`. Un `drafts.` en el medio deja un documento
 * publicado con un nombre que aparenta lo contrario, así que derivar el id de un borrador sin
 * separarlo apuntaría a un documento que no existe.
 *
 * `drafts.` no es el único prefijo de path que usa Sanity: las Content Releases versionan con
 * `versions.<release>.<id>`, que reintroduciría el mismo defecto. Hoy ningún llamador recorre esos
 * documentos, así que el corte contempla un solo prefijo; sumar otro exige generalizarlo acá.
 */
function derivedIdFor(prefix: string, sourceId: string): string {
	if (sourceId.startsWith(DRAFTS_PATH_PREFIX)) {
		return `${DRAFTS_PATH_PREFIX}${prefix}${sourceId.slice(DRAFTS_PATH_PREFIX.length)}`;
	}
	return `${prefix}${sourceId}`;
}

function literaryWorkIdFor(storyId: string): string {
	return derivedIdFor(MIGRATED_LITERARY_WORK_ID_PREFIX, storyId);
}

function collectionIdFor(storylistId: string): string {
	return derivedIdFor(MIGRATED_COLLECTION_ID_PREFIX, storylistId);
}

/**
 * Deriva las referencias del campo nuevo a partir de las del viejo.
 *
 * Las derivaciones de `_id` viven acá abajo, y no en la migración que creó los documentos destino: son
 * la única forma de nombrarlos, así que tienen que estar donde se los nombra. El mismo prefijo de obra
 * se declara además en la verificación de la purga, que es su otro consumidor.
 *
 * **La referencia se construye campo por campo y no se spreadea.** El destino cambia de tipo, así que
 * `_strengthenOnPublish` —que nombra contra qué tipo el Studio debe fortalecer la referencia al
 * publicarla— tiene que retraducirse: copiarla dejaría una referencia a una obra prometiendo fortalecerse
 * contra una historia. Es la misma distinción que ya resuelve la migración que creó estos documentos.
 *
 * **`_weak` se copia y nunca se sintetiza.** Una referencia débil dice que el destino todavía no está
 * publicado; debilitar una que el origen tiene fuerte taparía un dataset a medio migrar.
 *
 * El `_key` se preserva del origen: es estable, hace trazable de dónde salió cada entrada, y derivarlo
 * del `_ref` produciría claves duplicadas si un mismo destino aparece dos veces.
 */
function relink(
	references: readonly KeyedReference[] | undefined,
	derive: (id: string) => string,
	targetType: TargetType,
): KeyedReference[] {
	return (references ?? []).map((reference) => ({
		_type: 'reference',
		_ref: derive(reference._ref),
		_key: reference._key,
		...(reference._weak !== undefined ? { _weak: reference._weak } : {}),
		...(reference._strengthenOnPublish !== undefined
			? { _strengthenOnPublish: { type: targetType, template: { id: targetType } } }
			: {}),
	}));
}

export function buildCollectionReferences(references: readonly KeyedReference[] | undefined): KeyedReference[] {
	return relink(references, collectionIdFor, 'collection');
}

export function buildLiteraryWorkReferences(references: readonly KeyedReference[] | undefined): KeyedReference[] {
	return relink(references, literaryWorkIdFor, 'literaryWork');
}
