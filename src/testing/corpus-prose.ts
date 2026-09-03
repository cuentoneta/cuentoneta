// La prosa se deriva del propio fixture para que las aserciones no queden atadas a una obra puntual
// del canon; el umbral de longitud evita elegir un artículo o una preposición, demasiado frecuentes
// para identificar un texto.
export function firstProseWord(html: string): string {
	const [word] = html.replace(/<[^>]+>/g, ' ').match(/\p{L}{6,}/gu) ?? [];
	if (word === undefined) {
		throw new Error(`El texto del canon no tiene palabras suficientes: "${html}"`);
	}
	return word;
}
