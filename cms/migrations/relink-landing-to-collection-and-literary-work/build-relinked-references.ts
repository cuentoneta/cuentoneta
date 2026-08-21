import { collectionIdFor, isMigratedCollectionId } from '../storylist-to-collection/build-collection-document';
import { isMigratedLiteraryWorkId, literaryWorkIdFor } from '../story-to-literary-work/build-literary-work-document';

/** Una referencia dentro de un array de Sanity: la clave la asigna el editor y sobrevive al reapuntado. */
export interface KeyedReference {
	_key: string;
	_type: 'reference';
	_ref: string;
}

/**
 * Deriva las referencias del campo nuevo a partir de las del viejo.
 *
 * Las derivaciones de `_id` se **importan** de las migraciones que crearon los documentos destino en vez
 * de replicarse: una segunda noción de "cuál es el documento migrado" podría apuntar al vacío, y las
 * importadas ya contemplan el prefijo de path que marca a los borradores.
 *
 * Conserva el `_key` de origen —es estable y hace trazable de dónde salió cada entrada— y cambia sólo el
 * destino. Un `_ref` ya derivado se deja intacto, para que una segunda corrida no vuelva a prefijarlo.
 */
function relink(
	references: readonly KeyedReference[] | undefined,
	derive: (id: string) => string,
	isDerived: (id: string) => boolean,
): KeyedReference[] {
	return (references ?? []).map((reference) =>
		isDerived(reference._ref) ? reference : { ...reference, _ref: derive(reference._ref) },
	);
}

export function buildCollectionReferences(references: readonly KeyedReference[] | undefined): KeyedReference[] {
	return relink(references, collectionIdFor, isMigratedCollectionId);
}

export function buildLiteraryWorkReferences(references: readonly KeyedReference[] | undefined): KeyedReference[] {
	return relink(references, literaryWorkIdFor, isMigratedLiteraryWorkId);
}
