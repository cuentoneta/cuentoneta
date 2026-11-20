/**
 * Índice donde termina un recorte de `text` a lo sumo de `maxLength` caracteres sin partir una palabra: el
 * último whitespace antes del tope, sin el whitespace que lo precede. Un texto que ya cabe devuelve su largo;
 * uno sin whitespace antes del tope devuelve `maxLength`.
 */
export function wordBoundaryEnd(text: string, maxLength: number): number {
	if (text.length <= maxLength) {
		return text.length;
	}
	const lastWhitespace = text.slice(0, maxLength).search(/\s\S*$/);
	let end = lastWhitespace > 0 ? lastWhitespace : maxLength;
	while (end > 0 && /\s/.test(text[end - 1] ?? '')) {
		end--;
	}
	return end;
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
