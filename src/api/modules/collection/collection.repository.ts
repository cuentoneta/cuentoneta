import type { Collection, CollectionTeaser } from '@models/collection.model';
import type { MalformedCollectionError } from './collection.errors';

/**
 * Listado de teasers junto con lo que la ACL no pudo traducir.
 *
 * El repository **reporta** en vez de decidir: la misma colección intraducible tiene que tumbar su
 * detalle y no puede tumbar el catálogo, así que qué hacer con ella lo decide quien conoce el caso de
 * uso — el service.
 */
export interface CollectionTeaserListing {
	readonly collections: readonly CollectionTeaser[];
	readonly malformed: readonly MalformedCollectionError[];
}

// El listado devuelve teasers y no colecciones completas: la vista de catálogo muestra la colección
// sin sus obras, y transportarlas sería servir N agregados enteros para pintar N tarjetas.
export interface CollectionRepository {
	fetchBySlug(slug: string): Promise<Collection | null>;
	fetchAll(): Promise<CollectionTeaserListing>;
}
