import type { LiteraryWorkTeaser } from './literary-work.model';

/**
 * Ámbito con el que se llegó a la obra que se lee: el autor o la colección cuyas otras obras se
 * ofrecen al pie.
 *
 * Es excluyente, y por eso es una unión y no dos campos sueltos: sin ámbito no hay conjunto del que
 * sugerir, y con los dos el pedido se contradice.
 */
export type ReadingSuggestionsScope = { readonly author: string } | { readonly collection: string };

/**
 * El bloque de sugerencias de lectura al pie de una obra: el nombre del ámbito —el encabezado con el
 * que se invita a seguir leyendo— y las obras ya elegidas, sin la que se está leyendo.
 *
 * Un ámbito sin obras deja el título vacío y la lista vacía, que es el estado del que el bloque no se
 * pinta: la ausencia de sugerencias no es un error.
 */
export interface ReadingSuggestions {
	readonly title: string;
	readonly suggestions: readonly LiteraryWorkTeaser[];
}

/** El bloque sin nada que ofrecer, que es también el valor con el que un recurso lo espera. */
export const EMPTY_READING_SUGGESTIONS: ReadingSuggestions = { title: '', suggestions: [] };
