import { collectionIdFor } from '../storylist-to-collection/build-collection-document';
import { literaryWorkIdFor } from '../story-to-literary-work/build-literary-work-document';

/** Una referencia dentro de un array de Sanity: la clave la asigna el editor y sobrevive al reapuntado. */
export interface KeyedReference {
	_key: string;
	_type: 'reference';
	_ref: string;
	_weak?: boolean;
	_strengthenOnPublish?: { type: string; template?: { id: string } };
}

type TargetType = 'collection' | 'literaryWork';

/**
 * Deriva las referencias del campo nuevo a partir de las del viejo.
 *
 * Las derivaciones de `_id` se **importan** de las migraciones que crearon los documentos destino en vez
 * de replicarse: una segunda noción de "cuál es el documento migrado" podría apuntar al vacío, y las
 * importadas ya contemplan el prefijo de path que marca a los borradores.
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
