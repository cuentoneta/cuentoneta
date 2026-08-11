/**
 * Núcleo del inventario de comentarios: dado el texto de un archivo, devuelve sus comentarios con
 * posición, tipo y contenido. Lo consume `extract-comments.ts`, que aporta el recorrido del disco.
 *
 * Es un **escáner pragmático, no un parser**: reconoce las sintaxis de comentario por extensión y
 * saltea con una máquina de estados mínima lo que puede disfrazar un marcador de comentario —
 * literales de string y de expresión regular. Alcanza para inventariar y medir, que es lo que
 * necesita la skill `aposd-comment-audit`; no alcanza para reescribir código. Un lenguaje que no
 * figure acá se inventaría aparte con ripgrep — la skill ya prevé ese camino.
 *
 * Dos límites conocidos, que valen para leer sus números como aproximados y no como exactos:
 *
 * - La apertura de una regex se decide por **posición de operando** (qué token la precede), no por
 *   gramática. Un `/` que abra una regex en una posición inusual se leería como división; el daño
 *   se acota a esa línea, porque un literal sin cerrar termina en el salto de línea.
 * - En Markdown, un `<!-- … -->` que viva dentro de un bloque de código cercado se cuenta igual.
 *   Infla la línea de base en un repo denso en documentación que muestra marcado como ejemplo.
 *
 * Vive en `scripts/` y no junto a la skill porque `.claude/**` queda fuera de `typecheck`, de `test`
 * y del target de lint: un escáner sin verificación no es una herramienta, es una promesa.
 */

/** Un comentario ubicado en su archivo. `endLine` iguala a `line` salvo en bloques multilínea. */
export interface CommentRecord {
	readonly file: string;
	readonly line: number;
	readonly endLine: number;
	readonly kind: 'line' | 'block' | 'doc';
	readonly text: string;
}

/**
 * Las formas de comentario de un lenguaje. Un lenguaje puede no tener alguna de las dos.
 *
 * `hasStringLiterals` decide si el escáner saltea comillas: en un lenguaje de programación es
 * indispensable —un `//` dentro de un string no es un comentario—, pero en marcado sería
 * destructivo, porque cada apóstrofo de la prosa abriría un literal que nunca cierra.
 *
 * `hasRegexLiterals` hace lo propio con las expresiones regulares, y solo lo habilitan los
 * lenguajes que las tienen. En SCSS o CSS la barra es división o separador de valores, así que
 * tratarla como apertura de literal inventaría regiones que no existen.
 */
export interface CommentSyntax {
	readonly linePrefixes: readonly string[];
	readonly blockPairs: readonly (readonly [open: string, close: string])[];
	readonly hasStringLiterals: boolean;
	readonly hasRegexLiterals: boolean;
}

const JS_FAMILY: CommentSyntax = Object.freeze({
	linePrefixes: Object.freeze(['//']),
	blockPairs: Object.freeze([Object.freeze(['/*', '*/'] as const)]),
	hasStringLiterals: true,
	hasRegexLiterals: true,
});

const C_FAMILY: CommentSyntax = Object.freeze({
	linePrefixes: Object.freeze(['//']),
	blockPairs: Object.freeze([Object.freeze(['/*', '*/'] as const)]),
	hasStringLiterals: true,
	hasRegexLiterals: false,
});

const BLOCK_ONLY: CommentSyntax = Object.freeze({
	linePrefixes: Object.freeze([]),
	blockPairs: Object.freeze([Object.freeze(['/*', '*/'] as const)]),
	hasStringLiterals: true,
	hasRegexLiterals: false,
});

const HASH: CommentSyntax = Object.freeze({
	linePrefixes: Object.freeze(['#']),
	blockPairs: Object.freeze([]),
	hasStringLiterals: true,
	hasRegexLiterals: false,
});

const MARKUP: CommentSyntax = Object.freeze({
	linePrefixes: Object.freeze([]),
	blockPairs: Object.freeze([Object.freeze(['<!--', '-->'] as const)]),
	hasStringLiterals: false,
	hasRegexLiterals: false,
});

/**
 * Las familias de extensión de los lenguajes que este repo usa — completas, incluidas las variantes
 * que hoy no tienen ningún archivo: quien agregue el primer `.jsx` no debería tener que acordarse de
 * tocar este mapa. Lo que queda afuera son los lenguajes que el repo **no** usa (Rust, Swift, Lua,
 * SQL…), que la lista larga habitual de estos escáneres arrastra: cada entrada de esas es una
 * sintaxis que nadie ejercita y que igual hay que sostener.
 */
export const SYNTAX_BY_EXTENSION: Readonly<Record<string, CommentSyntax>> = Object.freeze({
	'.ts': JS_FAMILY,
	'.tsx': JS_FAMILY,
	'.mts': JS_FAMILY,
	'.cts': JS_FAMILY,
	'.js': JS_FAMILY,
	'.jsx': JS_FAMILY,
	'.mjs': JS_FAMILY,
	'.cjs': JS_FAMILY,
	'.scss': C_FAMILY,
	'.css': BLOCK_ONLY,
	'.sh': HASH,
	'.yml': HASH,
	'.yaml': HASH,
	'.html': MARKUP,
	'.md': MARKUP,
});

/** Directorios que nunca aportan comentarios propios: dependencias, artefactos y copias de trabajo. */
export const EXCLUDED_DIRECTORIES: ReadonlySet<string> = new Set([
	'node_modules',
	'dist',
	'.git',
	'.angular',
	'.nx',
	'coverage',
	'worktrees',
	'workspace',
]);

const STRING_DELIMITERS: ReadonlySet<string> = new Set(['"', "'", '`']);

/** Posición del escáner: desplazamiento en el texto y la línea (1-based) que le corresponde. */
interface Cursor {
	readonly index: number;
	readonly line: number;
}

/**
 * Avanza más allá del literal de string que abre en `cursor`, para que un `//` o un `#` que viva
 * adentro no se cuente como comentario. Las comillas simples y dobles se cierran también al fin de
 * línea: un literal sin cerrar es un error de sintaxis, y darlo por terminado ahí evita que el
 * escáner se coma el resto del archivo.
 */
function skipStringLiteral(text: string, cursor: Cursor): Cursor {
	const delimiter = text[cursor.index];
	const multiline = delimiter === '`';
	let { index, line } = cursor;
	index++;

	while (index < text.length) {
		const char = text[index];
		if (char === '\\') {
			index += 2;
			continue;
		}
		if (char === delimiter) {
			return { index: index + 1, line };
		}
		if (char === '\n') {
			line++;
			if (!multiline) {
				return { index: index + 1, line };
			}
		}
		index++;
	}
	return { index, line };
}

/**
 * Los tokens tras los cuales una barra abre una expresión regular en vez de dividir. El criterio es
 * de **posición**: después de uno de estos falta un operando, y una división ahí sería inválida.
 */
const OPERAND_PRECEDING: ReadonlySet<string> = new Set(['=', '(', ',', '[', ':', '!', '&', '|', '?', ';', '{']);

/** Palabras clave que también dejan la posición esperando un operando. */
const OPERAND_KEYWORDS: readonly string[] = ['return', 'typeof', 'case', 'in', 'of', 'yield', 'await'];

/**
 * Si la barra en `index` abre una expresión regular. Sin esto, la barra escapada de `/…\/…/` se
 * confunde con un `//` y emite un comentario fantasma; peor, una regex que contenga `/*` abre un
 * bloque que se traga los comentarios reales que vienen después, hasta el próximo cierre de bloque.
 *
 * Los marcadores de comentario se evalúan **antes** que esta función, así que un `//` o un `/*` en
 * posición de operando —`const a = // …`— sigue leyéndose como comentario, que es lo correcto.
 */
function startsRegexLiteral(text: string, index: number): boolean {
	let position = index - 1;
	while (position >= 0 && /\s/.test(text[position])) {
		position--;
	}
	if (position < 0) {
		return true;
	}
	if (OPERAND_PRECEDING.has(text[position])) {
		return true;
	}

	const wordEnd = position + 1;
	while (position >= 0 && /[a-zA-Z]/.test(text[position])) {
		position--;
	}
	return OPERAND_KEYWORDS.includes(text.slice(position + 1, wordEnd));
}

/**
 * Avanza más allá del literal de expresión regular que abre en `cursor`. Una barra dentro de una
 * clase de caracteres (`/[/]/`) no cierra. Como en los strings, un literal que llega al fin de línea
 * se da por terminado: acota el daño de una barra mal clasificada a su propio renglón.
 */
function skipRegexLiteral(text: string, cursor: Cursor): Cursor {
	let index = cursor.index + 1;
	let insideClass = false;

	while (index < text.length) {
		const char = text[index];
		if (char === '\\') {
			index += 2;
			continue;
		}
		if (char === '\n') {
			return { index: index + 1, line: cursor.line + 1 };
		}
		if (char === '[') {
			insideClass = true;
		} else if (char === ']') {
			insideClass = false;
		} else if (char === '/' && !insideClass) {
			return { index: index + 1, line: cursor.line };
		}
		index++;
	}
	return { index, line: cursor.line };
}

/** El par de delimitadores de bloque que abre en `cursor`, si alguno lo hace. */
function openingBlockPair(
	text: string,
	cursor: Cursor,
	pairs: CommentSyntax['blockPairs'],
): CommentSyntax['blockPairs'][number] | undefined {
	return pairs.find(([open]) => text.startsWith(open, cursor.index));
}

/** Lee el comentario de bloque que abre en `cursor`. Un bloque sin cerrar se extiende al fin de archivo. */
function readBlockComment(
	file: string,
	text: string,
	cursor: Cursor,
	[open, close]: CommentSyntax['blockPairs'][number],
): { readonly comment: CommentRecord; readonly next: Cursor } {
	const closeIndex = text.indexOf(close, cursor.index + open.length);
	const end = closeIndex === -1 ? text.length : closeIndex + close.length;
	const body = text.slice(cursor.index, end);
	const endLine = cursor.line + (body.match(/\n/g) ?? []).length;

	return {
		comment: {
			file,
			line: cursor.line,
			endLine,
			kind: body.startsWith('/**') ? 'doc' : 'block',
			text: body.trim(),
		},
		next: { index: end, line: endLine },
	};
}

/** Lee el comentario de línea que abre en `cursor`, hasta el salto de línea exclusive. */
function readLineComment(
	file: string,
	text: string,
	cursor: Cursor,
): { readonly comment: CommentRecord; readonly next: Cursor } {
	const newline = text.indexOf('\n', cursor.index);
	const end = newline === -1 ? text.length : newline;

	return {
		comment: {
			file,
			line: cursor.line,
			endLine: cursor.line,
			kind: 'line',
			text: text.slice(cursor.index, end).trim(),
		},
		next: { index: end, line: cursor.line },
	};
}

/** El `#!` de la primera línea declara el intérprete; contarlo como comentario ensuciaría cada script. */
function isShebang(text: string, cursor: Cursor, prefix: string): boolean {
	return prefix === '#' && cursor.line === 1 && text.startsWith('#!', cursor.index);
}

/** El comentario que abre en `cursor`, sea de bloque o de línea, o `null` si no abre ninguno. */
function readCommentAt(
	file: string,
	text: string,
	cursor: Cursor,
	syntax: CommentSyntax,
): { readonly comment: CommentRecord; readonly next: Cursor } | null {
	const pair = openingBlockPair(text, cursor, syntax.blockPairs);
	if (pair) {
		return readBlockComment(file, text, cursor, pair);
	}

	const prefix = syntax.linePrefixes.find((candidate) => text.startsWith(candidate, cursor.index));
	if (prefix && !isShebang(text, cursor, prefix)) {
		return readLineComment(file, text, cursor);
	}
	return null;
}

/**
 * Avanza sobre lo que no es comentario: el salto de línea que cuenta un renglón, y los literales que
 * pueden esconder un marcador adentro. Cuando nada de eso aplica, avanza un carácter.
 */
function skipNonComment(text: string, cursor: Cursor, syntax: CommentSyntax): Cursor {
	const char = text[cursor.index];

	if (char === '\n') {
		return { index: cursor.index + 1, line: cursor.line + 1 };
	}
	if (syntax.hasStringLiterals && STRING_DELIMITERS.has(char)) {
		return skipStringLiteral(text, cursor);
	}
	if (syntax.hasRegexLiterals && char === '/' && startsRegexLiteral(text, cursor.index)) {
		return skipRegexLiteral(text, cursor);
	}
	return { index: cursor.index + 1, line: cursor.line };
}

/** Los comentarios de un archivo, en orden de aparición. */
export function extractComments(file: string, text: string, syntax: CommentSyntax): CommentRecord[] {
	const comments: CommentRecord[] = [];
	let cursor: Cursor = { index: 0, line: 1 };

	// El orden importa: un `//` en posición de operando es un comentario, no la apertura de una
	// expresión regular.
	while (cursor.index < text.length) {
		const read = readCommentAt(file, text, cursor, syntax);
		if (read) {
			comments.push(read.comment);
			cursor = read.next;
			continue;
		}
		cursor = skipNonComment(text, cursor, syntax);
	}

	return comments;
}
