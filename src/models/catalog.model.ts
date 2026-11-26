// Declara la forma común de las entradas del catálogo y el sobre en el que el catálogo las publica. Las
// entradas comparten el discriminante y el slug de su destino, y nada más: cada una conserva su campo
// natural de etiqueta (`title`, `name`).
import type { Slug } from './slug.model';
import type { LiteraryWorkCatalogEntry } from './literary-work.model';

export interface CatalogEntryBase<K extends string> {
	readonly kind: K;
	readonly slug: Slug;
}

export type CatalogEntry = LiteraryWorkCatalogEntry;

export interface Catalog<E extends CatalogEntry> {
	readonly entries: readonly E[];
	// Cuántas entradas publica el catálogo después de excluir lo mal formado y antes de paginar: una página
	// lista algunas de ellas, nunca más.
	readonly total: number;
}

/**
 * Construye el sobre del catálogo con las entradas en el orden recibido. Lanza si `total` no es un entero
 * no negativo o si es menor que la cantidad de entradas.
 */
export function createCatalog<E extends CatalogEntry>(entries: readonly E[], total: number): Catalog<E> {
	if (!Number.isInteger(total) || total < 0 || total < entries.length) {
		throw new Error(`Catalog inválido: total ${total} para ${entries.length} entradas`);
	}
	return Object.freeze({ entries: Object.freeze([...entries]), total });
}
