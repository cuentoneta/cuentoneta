import type { LiteraryWork, LiteraryWorkCatalogEntry, LiteraryWorkTeaser } from '@models/literary-work.model';
import type { MalformedLiteraryWorkError } from './literary-work.errors';

/**
 * Listado de obras junto con lo que la ACL no pudo traducir.
 *
 * El repository **reporta** en vez de decidir: la misma obra intraducible tiene que tumbar el
 * agregado que la cura y no puede tumbar un bloque accesorio, así que qué hacer con ella lo decide
 * quien conoce el caso de uso — el service.
 */
export interface LiteraryWorkListing<T> {
	readonly literaryWorks: readonly T[];
	readonly malformed: readonly MalformedLiteraryWorkError[];
}

export type LiteraryWorkTeaserListing = LiteraryWorkListing<LiteraryWorkTeaser>;

// El filtro es un registro y no un slug posicional: cada criterio nuevo suma acá un campo opcional,
// no una firma ni una sub-ruta.
export interface LiteraryWorkTeaserFilter {
	readonly author?: string;
	readonly slugs?: readonly string[];
}

// El catálogo solo se filtra por autor: el lote por slugs es de quien cura teasers puntuales.
export type LiteraryWorkCatalogFilter = Pick<LiteraryWorkTeaserFilter, 'author'>;

export interface LiteraryWorkRepository {
	fetchBySlug(slug: string): Promise<LiteraryWork | null>;
	fetchTeasers(filter: LiteraryWorkTeaserFilter): Promise<LiteraryWorkTeaserListing>;
	fetchCatalog(filter: LiteraryWorkCatalogFilter): Promise<LiteraryWorkListing<LiteraryWorkCatalogEntry>>;
}
