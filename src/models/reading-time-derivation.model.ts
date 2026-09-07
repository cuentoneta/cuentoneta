import { unified } from 'unified';
import remarkParse from 'remark-parse';
import type { Markdown } from './markdown.model';
import { createWordCount, type WordCount } from './word-count.model';
import { deriveReadingTime, sumReadingTimes, type ReadingTime } from './reading-time.model';

// Tipado estructural mínimo del mdast: alcanza para el walker sin acoplar @types/mdast.
interface MarkdownNode {
	readonly type: string;
	readonly value?: string;
	readonly children?: readonly MarkdownNode[];
}

// Solo texto que el lector efectivamente lee: excluye nodos `html` crudos (tags no son palabras)
// y el `alt` de las imágenes (metadata) — semántica que mdast-util-to-string incluía por defecto.
const readableLiteralTypes = new Set(['text', 'inlineCode', 'code']);

// Array vacío compartido: evita alocar un literal por hoja al defaultar `children`.
const NO_CHILDREN: readonly MarkdownNode[] = Object.freeze([]);

const WORD_CHARACTER_PATTERN = /[\p{L}\p{N}]/u;
const WHITESPACE_PATTERN = /\s+/;

function hasWordCharacter(word: string): boolean {
	return WORD_CHARACTER_PATTERN.test(word);
}

// Recorrido en profundidad con pila explícita (pre-order, hijos en orden de documento): la
// profundidad del mdast la fija el contenido (cada `>` o nivel de lista anida otro nodo), así
// que la recursión directa puede agotar el call stack del runtime con documentos patológicos;
// la pila traslada ese límite del stack al heap.
function collectReadableText(root: MarkdownNode, fragments: string[]): void {
	const pending: Array<MarkdownNode> = [root];
	for (let node = pending.pop(); node !== undefined; node = pending.pop()) {
		if (node.value !== undefined && readableLiteralTypes.has(node.type)) {
			fragments.push(node.value);
		}
		const children = node.children ?? NO_CHILDREN;
		for (let index = children.length - 1; index >= 0; index--) {
			pending.push(children[index]);
		}
	}
}

// Singleton de módulo: construir el parser unified es costoso y es inmutable; freeze() es la
// forma documentada de exponer un procesador reutilizable (cada parse() es independiente).
const markdownParser = unified().use(remarkParse).freeze();

export function countWords(markdown: Markdown): WordCount {
	const fragments: string[] = [];
	collectReadableText(markdownParser.parse(markdown), fragments);
	// Una palabra contiene al menos una letra o número: la puntuación que queda suelta al
	// separar nodos inline ("negrita" + ",") no cuenta. Tokenizar por fragmento produce los
	// mismos tokens que unir todo el texto y re-partirlo, sin materializar dos copias del cuerpo.
	let count = 0;
	for (const fragment of fragments) {
		count += fragment.split(WHITESPACE_PATTERN).filter(hasWordCharacter).length;
	}
	return createWordCount(count);
}

// Composición canónica body → palabras → minutos. Fuente única del algoritmo de reading time: la
// comparten el backfill batch, que persiste, y el fallback de lectura del repository, que no; ambos
// tienen que producir el mismo número por sección.
export function deriveSectionReadingTime(body: Markdown): ReadingTime {
	return deriveReadingTime(countWords(body));
}

// Total de la obra: suma de los tiempos por sección (mínimo 1). Es la suma pura del texto — un
// eventual total editorial (obras recitadas) lo aplica la capa que consume estos helpers, no acá.
export function deriveTotalReadingTime(bodies: readonly Markdown[]): ReadingTime {
	return sumReadingTimes(bodies.map(deriveSectionReadingTime));
}
