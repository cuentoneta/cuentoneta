import type { Collection, CollectionTeaser } from '@models/collection.model';

// El listado devuelve teasers y no colecciones completas: la vista de catálogo muestra la colección
// sin sus obras, y transportarlas sería servir N agregados enteros para pintar N tarjetas.
export interface CollectionRepository {
	fetchBySlug(slug: string): Promise<Collection | null>;
	fetchAll(): Promise<CollectionTeaser[]>;
}
