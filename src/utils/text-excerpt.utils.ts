/**
 * Recorta `text` a lo sumo a `maxLength` caracteres sin partir una palabra: corta en el último espacio
 * antes del tope y agrega `…`, que no cuenta dentro de `maxLength`. Un texto que ya cabe vuelve intacto;
 * uno sin espacios antes del tope se corta en el tope.
 */
export function excerptAtWordBoundary(text: string, maxLength: number): string {
	if (text.length <= maxLength) {
		return text;
	}
	const truncated = text.slice(0, maxLength);
	const lastSpace = truncated.lastIndexOf(' ');
	return `${truncated.slice(0, lastSpace > 0 ? lastSpace : maxLength).trimEnd()}…`;
}
