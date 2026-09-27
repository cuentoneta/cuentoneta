import type { LiteraryWork, LiteraryWorkCatalogEntry, LiteraryWorkTeaser } from '@models/literary-work.model';
import type { MalformedLiteraryWorkError } from './literary-work.errors';

/**
 * Listado de teasers junto con lo que la ACL no pudo traducir.
 *
 * El repository **reporta** en vez de decidir: la misma obra intraducible tiene que tumbar el
 * agregado que la cura y no puede tumbar un bloque accesorio, así que qué hacer con ella lo decide
 * quien conoce el caso de uso — el service.
 */
export interface LiteraryWorkTeaserListing {
	readonly literaryWorks: readonly LiteraryWorkTeaser[];
	readonly malformed: readonly MalformedLiteraryWorkError[];
}

// El listado del catálogo plano reporta las obras intraducibles con la misma política que el de
// teasers — el repository reporta y el service decide —, pero transporta la vista sin tarjeta.
export interface LiteraryWorkCatalogListing {
	readonly literaryWorks: readonly LiteraryWorkCatalogEntry[];
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
	fetchTeasers(filter: LiteraryWorkTeaserFilter): Promise<LiteraryWorkTeaserListing>;
	fetchCatalog(): Promise<LiteraryWorkCatalogListing>;
}
