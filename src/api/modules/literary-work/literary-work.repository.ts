import type { LiteraryWork, LiteraryWorkTeaser } from '@models/literary-work.model';
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

export interface LiteraryWorkRepository {
	fetchBySlug(slug: string): Promise<LiteraryWork | null>;
	fetchByAuthorSlug(slug: string): Promise<LiteraryWorkTeaserListing>;
}
