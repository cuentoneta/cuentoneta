// Cota del texto que se pinta sobre la imagen: más allá de esto no entra en la caja del renderizado,
// y el valor llega de un query param público sin ninguna otra restricción de tamaño.
const MAX_LENGTH = 120;

const MARKUP_ESCAPES: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
};

/**
 * Resuelve la leyenda que va sobre la imagen de Open Graph leyendo los query params del pedido.
 *
 * Recibe el lector en vez de los valores ya extraídos para que los nombres de los parámetros
 * —`collection`, `author`, `title`— queden dentro de la unidad que los tests ejercitan: un typo en
 * uno de ellos degrada silenciosamente a la marca, con status 200 y sin excepción.
 *
 * El nombre de la colección gana sobre el par autor + título, y ambos sobre la marca: el pedido que
 * comparte una colección entera no tiene una obra que nombrar. Un parámetro en blanco no cuenta
 * como provisto.
 *
 * El resultado viene **escapado y acotado**, listo para interpolarse en el markup que consume el
 * renderizador. Devolver el texto crudo dejaría al llamador a cargo de una garantía que solo se
 * verifica acá.
 */
export function resolveOgText(readQueryParam: (name: string) => string | undefined): string {
	const collection = readTrimmed(readQueryParam, 'collection');
	const author = readTrimmed(readQueryParam, 'author');
	const title = readTrimmed(readQueryParam, 'title');

	if (collection) {
		return toMarkupSafeText(collection);
	}

	if (author && title) {
		return toMarkupSafeText(`${title} - ${author}`);
	}

	return 'La Cuentoneta';
}

function readTrimmed(readQueryParam: (name: string) => string | undefined, name: string): string {
	return (readQueryParam(name) ?? '').trim();
}

function toMarkupSafeText(text: string): string {
	return text.slice(0, MAX_LENGTH).replace(/[&<>"']/g, (character) => MARKUP_ESCAPES[character]);
}
