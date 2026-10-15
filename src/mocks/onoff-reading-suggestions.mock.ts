import { resolveAuthorName, type LiteraryWorkTeaser } from '@models/literary-work.model';
import type { ReadingSuggestions, ReadingSuggestionsScope } from '@models/reading-suggestions.model';
import { EMPTY_READING_SUGGESTIONS } from '@models/reading-suggestions.model';
import { onoffLiteraryWorkTeasersMock } from './onoff-literary-work-teasers.mock';
import { onoffCollectionsMock } from './onoff-collections.mock';

/**
 * El bloque de sugerencias de un ámbito del corpus, para las stories y los dobles que lo necesitan
 * montado: el encabezado del ámbito y hasta tres de sus obras, sin la que se lee.
 *
 * El recorte no reproduce el criterio del backend —afinidad y rotación—: acá alcanza con traer obras del
 * ámbito para mirar el bloque, así que el orden que sale es el del corpus y no el de producción. Un
 * ámbito que el corpus no tiene deja el bloque vacío, que es el estado del que no se pinta.
 */
export function onoffReadingSuggestionsMock(
	scope: ReadingSuggestionsScope,
	currentWorkSlug: string,
): ReadingSuggestions {
	if ('collection' in scope) {
		const collection = onoffCollectionsMock.find(({ slug }) => slug === scope.collection);
		return collection
			? { title: collection.title, suggestions: suggestionsOf(collection.literaryWorks, currentWorkSlug) }
			: EMPTY_READING_SUGGESTIONS;
	}

	const worksOfAuthor = onoffLiteraryWorkTeasersMock.filter(({ authors }) =>
		authors.some(({ slug }) => slug === scope.author),
	);
	return {
		title: resolveAuthorName(worksOfAuthor, scope.author),
		suggestions: suggestionsOf(worksOfAuthor, currentWorkSlug),
	};
}

function suggestionsOf(works: readonly LiteraryWorkTeaser[], currentWorkSlug: string): readonly LiteraryWorkTeaser[] {
	// Hasta tres, que es lo que el backend devuelve cuando el pedido no pide `limit`.
	const count = 3;
	return works.filter(({ slug }) => slug !== currentWorkSlug).slice(0, count);
}
