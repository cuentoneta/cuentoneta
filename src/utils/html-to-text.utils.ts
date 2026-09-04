import type { SanitizedHtml } from '@models/sanitized-html.model';

// Los tags de bloque dejan un espacio al desaparecer: sin él, la última palabra de un bloque
// quedaría pegada a la primera del siguiente. Los inline (`em`, `strong`, `a`, `code`) se quitan
// sin espacio, porque abren y cierran dentro de la oración y un espacio ahí despega la puntuación.
const BLOCK_LEVEL_TAG = /<\/?(?:p|div|br|hr|h[1-6]|ul|ol|li|blockquote|pre|figure|figcaption|table|tr|td|th)\b[^>]*>/gi;

// El pipeline emite referencias **numéricas** (`rehype-stringify` no usa referencias con nombre), pero
// se aceptan las dos formas para no depender de esa configuración. Una única pasada, no una por
// entidad: así `&amp;#x26;` se resuelve a `&#x26;` y no se decodifica dos veces hasta `&`.
const HTML_REFERENCE = /&(?:#[xX]([0-9a-fA-F]+)|#(\d+)|(amp|lt|gt|quot|apos));/g;

const NAMED_REFERENCES: Readonly<Record<string, string>> = Object.freeze({
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
});

function decodeReferences(text: string): string {
	return text.replace(HTML_REFERENCE, (match, hex?: string, decimal?: string, name?: string) => {
		if (hex !== undefined) return String.fromCodePoint(Number.parseInt(hex, 16));
		if (decimal !== undefined) return String.fromCodePoint(Number.parseInt(decimal, 10));
		return name !== undefined ? (NAMED_REFERENCES[name] ?? match) : match;
	});
}

/**
 * Reduce HTML saneado a texto plano: une los bloques con espacios, descarta la marcación inline sin
 * despegar la puntuación y decodifica las referencias de caracteres. Devuelve `''` cuando el HTML no
 * trae prosa (p. ej. solo una imagen). No toca el DOM, así que vale en el SSR de Node.
 *
 * No recorta: el largo razonable depende de la señal que lo consume (`meta description`, JSON-LD) y
 * lo decide cada una.
 */
export function htmlToPlainText(html: SanitizedHtml): string {
	// Las referencias se decodifican después de quitar los tags, para que un `<` del texto no se
	// reinterprete como marcado.
	const withoutTags = html.replace(BLOCK_LEVEL_TAG, ' ').replace(/<[^>]*>/g, '');
	return decodeReferences(withoutTags).replace(/\s+/g, ' ').trim();
}
