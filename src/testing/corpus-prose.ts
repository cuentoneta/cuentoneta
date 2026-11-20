// El texto que cuenta el tope del extracto, medido con el parser del DOM y no con el código del recorte
// que se quiere verificar: `textContent` no cuenta etiquetas ni imágenes, y un salto de verso aporta el
// '\n' que acompaña al <br>. El `…` final no cuenta.
export function visibleText(html: string): string {
	const container = document.createElement('div');
	container.innerHTML = html;
	return (container.textContent ?? '').replace(/…$/, '');
}

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
