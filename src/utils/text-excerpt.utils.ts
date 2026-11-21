/**
 * Índice donde termina un recorte de `text` a lo sumo de `maxLength` caracteres sin partir una palabra: el
 * último whitespace hasta el tope inclusive, sin el whitespace que lo precede. Un texto que ya cabe devuelve
 * su largo; uno sin otro límite de palabra antes del tope devuelve `maxLength`. Nunca devuelve 0 para un
 * texto que no cabe.
 */
export function wordBoundaryEnd(text: string, maxLength: number): number {
	if (text.length <= maxLength) {
		return text.length;
	}
	const lastWhitespace = text.slice(0, maxLength + 1).search(/\s\S*$/);
	let end = lastWhitespace > 0 ? lastWhitespace : maxLength;
	while (end > 0 && /\s/.test(text[end - 1] ?? '')) {
		end--;
	}
	return end > 0 ? end : maxLength;
}

/**
 * Recorta `text` a lo sumo a `maxLength` caracteres sin partir una palabra: corta en el último whitespace
 * antes del tope y agrega `…`, que no cuenta dentro de `maxLength`. Un texto que ya cabe vuelve intacto;
 * uno sin whitespace antes del tope se corta en el tope.
 */
export function excerptAtWordBoundary(text: string, maxLength: number): string {
	if (text.length <= maxLength) {
		return text;
	}
	return `${text.slice(0, wordBoundaryEnd(text, maxLength))}…`;
}
