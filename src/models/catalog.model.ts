// Las entradas del catálogo comparten el discriminante y el slug de su destino, y nada más: cada una
// conserva su campo natural de etiqueta (`title`, `name`).
import type { Slug } from './slug.model';
import type { LiteraryWorkCatalogEntry } from './literary-work.model';

// Un valor por cada tipo de entrada que existe: una entrada nueva suma acá su discriminante.
export const CATALOG_ENTRY_KINDS = Object.freeze({
	literaryWork: 'literaryWork',
} as const);

export type CatalogEntryKind = (typeof CATALOG_ENTRY_KINDS)[keyof typeof CATALOG_ENTRY_KINDS];

export interface CatalogEntryBase<K extends CatalogEntryKind> {
	readonly kind: K;
	readonly slug: Slug;
}

export type CatalogEntry = LiteraryWorkCatalogEntry;
