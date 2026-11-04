import type { LiteraryWork, LiteraryWorkTeaser } from '@models/literary-work.model';
import type { ReadingSuggestionsScope } from '@models/reading-suggestions.model';
import type { Tag } from '@models/tag.model';
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

/**
 * Las obras del ámbito de las sugerencias de lectura, encabezadas por su nombre —el del autor o el de
 * la colección—, junto con lo que la ACL no pudo traducir.
 */
export interface LiteraryWorkSuggestionsListing extends LiteraryWorkTeaserListing {
	readonly title: string;
}

/**
 * Lo mínimo para ordenar una candidata: el service decide el orden antes de que el repository
 * traduzca, y así el extracto de las obras que no se muestran no se sanea.
 */
export interface LiteraryWorkSuggestionCandidate {
	readonly slug: string;
	readonly tags: readonly Tag[];
}

/**
 * El nombre del autor que encabeza el listado de sus obras: viaja dentro de ellas, así que el listado
 * no necesita leer el perfil. Sin obras no hay nombre; el vacío deja esa decisión al llamador.
 */
export function resolveAuthorName(
	literaryWorks: ReadonlyArray<{
		readonly authors: readonly { readonly slug: string; readonly name: string }[];
	}>,
	authorSlug: string,
): string {
	for (const literaryWork of literaryWorks) {
		for (const author of literaryWork.authors) {
			if (author.slug === authorSlug) {
				return author.name;
			}
		}
	}
	return '';
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
	// El service ordena las candidatas y el repository traduce solo las que hacen falta, hasta `limit`
	// obras sanas: el extracto de las descartadas no se sanea.
	fetchSuggestions(
		scope: ReadingSuggestionsScope,
		select: (candidates: readonly LiteraryWorkSuggestionCandidate[]) => readonly string[],
		limit: number,
	): Promise<LiteraryWorkSuggestionsListing>;
}
