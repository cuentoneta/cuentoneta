import { SanitizedHtml } from '@models/sanitized-html.model';

// Tags que separan texto: al desaparecer dejan un espacio, o la última palabra de un bloque quedaría
// pegada a la primera del siguiente. Los inline (`em`, `strong`, `a`, `code`) se quitan sin espacio,
// porque abren y cierran dentro de la oración y un espacio ahí despega la puntuación que los sigue.
const BLOCK_LEVEL_TAG = /<\/?(?:p|div|br|hr|h[1-6]|ul|ol|li|blockquote|pre|figure|figcaption|table|tr|td|th)\b[^>]*>/gi;

// Únicas entidades que la allow-list del pipeline puede emitir. Se decodifican después de quitar los
// tags, para que un `&lt;` del texto no se reinterprete como marcado; `&amp;` va última, o
// `&amp;lt;` se decodificaría dos veces y terminaría como `<`.
const HTML_ENTITIES = Object.freeze([
	['&lt;', '<'],
	['&gt;', '>'],
	['&quot;', '"'],
	['&#39;', "'"],
	['&amp;', '&'],
] as const);

/**
 * Reduce a texto plano el HTML saneado que produce el pipeline compartido. No usa `DOMParser`: esto
 * corre también en el SSR de Node, donde no existe.
 */
export function htmlToPlainText(html: SanitizedHtml): string {
	const withoutTags = html.replace(BLOCK_LEVEL_TAG, ' ').replace(/<[^>]*>/g, '');
	const decoded = HTML_ENTITIES.reduce((text, [entity, character]) => text.split(entity).join(character), withoutTags);
	return decoded.replace(/\s+/g, ' ').trim();
}
