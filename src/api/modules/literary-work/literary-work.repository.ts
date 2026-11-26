import type { LiteraryWork, LiteraryWorkCatalogEntry, LiteraryWorkTeaser } from '@models/literary-work.model';
import type { MalformedLiteraryWorkError } from './literary-work.errors';

/**
 * Los avances que la ACL pudo traducir, junto con las obras que no.
 *
 * El repository **reporta** en vez de decidir: la misma obra intraducible tiene que tumbar el
 * agregado que la transporta y no puede tumbar un bloque accesorio, así que qué hacer con ella lo decide
 * quien conoce el caso de uso — el service.
 */
export interface LiteraryWorkTeaserFetchResult {
	readonly teasers: readonly LiteraryWorkTeaser[];
	readonly malformed: readonly MalformedLiteraryWorkError[];
}

/**
 * Las entradas del catálogo que la ACL pudo traducir, junto con las obras que no, por el mismo motivo que
 * `LiteraryWorkTeaserFetchResult`.
 */
export interface LiteraryWorkCatalogEntryFetchResult {
	readonly catalogEntries: readonly LiteraryWorkCatalogEntry[];
	readonly malformed: readonly MalformedLiteraryWorkError[];
}

// El filtro es un registro y no un slug posicional: cada criterio nuevo suma acá un campo opcional,
// no una firma ni una sub-ruta.
export interface LiteraryWorkTeaserFilter {
	readonly author?: string;
	readonly slugs?: readonly string[];
}

export interface LiteraryWorkRepository {
	fetchBySlug(slug: string): Promise<LiteraryWork | null>;
	fetchTeasers(filter: LiteraryWorkTeaserFilter): Promise<LiteraryWorkTeaserFetchResult>;
	/**
	 * Las entradas del catálogo de obras, ordenadas por slug. Entre slugs iguales el orden es estable, pero
	 * cuál va primero no forma parte del contrato. Sin paginar.
	 */
	fetchCatalogEntries(): Promise<LiteraryWorkCatalogEntryFetchResult>;
}
