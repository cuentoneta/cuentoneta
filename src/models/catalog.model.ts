// Las entradas del catálogo comparten el discriminante y el slug de su destino, y nada más: cada una
// conserva su campo natural de etiqueta (`title`, `name`).
import type { Slug } from './slug.model';
import type { LiteraryWorkCatalogEntry } from './literary-work.model';

export interface CatalogEntryBase<K extends string> {
	readonly kind: K;
	readonly slug: Slug;
}

export type CatalogEntry = LiteraryWorkCatalogEntry;
