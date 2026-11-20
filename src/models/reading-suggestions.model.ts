import type { LiteraryWorkTeaser } from './literary-work.model';

/**
 * Ámbito con el que se llegó a la obra que se lee: el autor o la colección cuyas otras obras se
 * ofrecen al pie. Es excluyente —sin ámbito no hay conjunto del que sugerir, y con los dos el pedido
 * se contradice—, así que se modela como unión y no como dos campos sueltos.
 */
export type ReadingSuggestionsScope = { readonly author: string } | { readonly collection: string };

/**
 * El bloque de sugerencias al pie de una obra: el nombre del ámbito, que lo encabeza, y las obras ya
 * elegidas, sin la que se está leyendo. Un ámbito sin obras deja las dos partes vacías, que es el
 * estado del que el bloque no se pinta.
 */
export interface ReadingSuggestions {
	readonly title: string;
	readonly suggestions: readonly LiteraryWorkTeaser[];
}

/** El bloque sin nada que ofrecer, que es también el valor con el que un recurso lo espera. */
export const EMPTY_READING_SUGGESTIONS: ReadingSuggestions = { title: '', suggestions: [] };

/**
 * Cuántas sugerencias muestra el bloque: el mismo número fija el default del endpoint, el `limit` que
 * manda el cliente y los slots que reserva el skeleton.
 */
export const READING_SUGGESTIONS_COUNT = 3;
