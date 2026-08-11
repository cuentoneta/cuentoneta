/**
 * Núcleo del inventario de comentarios: dado el texto de un archivo, devuelve sus comentarios con
 * posición, tipo y contenido. Lo consume `extract-comments.ts`, que aporta el recorrido del disco.
 *
 * Es un **escáner pragmático, no un parser**: reconoce las sintaxis de comentario por extensión y
 * saltea literales de string con una máquina de estados mínima. Alcanza para inventariar y medir,
 * que es lo que necesita la skill `aposd-comment-audit`; no alcanza para reescribir código. Un
 * lenguaje que no figure acá se inventaría aparte con ripgrep — la skill ya prevé ese camino.
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
 */
export interface CommentSyntax {
	readonly linePrefixes: readonly string[];
	readonly blockPairs: readonly (readonly [open: string, close: string])[];
	readonly hasStringLiterals: boolean;
}

const C_FAMILY: CommentSyntax = Object.freeze({
	linePrefixes: Object.freeze(['//']),
	blockPairs: Object.freeze([Object.freeze(['/*', '*/'] as const)]),
	hasStringLiterals: true,
});

const BLOCK_ONLY: CommentSyntax = Object.freeze({
	linePrefixes: Object.freeze([]),
	blockPairs: Object.freeze([Object.freeze(['/*', '*/'] as const)]),
	hasStringLiterals: true,
});

const HASH: CommentSyntax = Object.freeze({
	linePrefixes: Object.freeze(['#']),
	blockPairs: Object.freeze([]),
	hasStringLiterals: true,
});

const MARKUP: CommentSyntax = Object.freeze({
	linePrefixes: Object.freeze([]),
	blockPairs: Object.freeze([Object.freeze(['<!--', '-->'] as const)]),
	hasStringLiterals: false,
});

/**
 * Extensiones que este repo contiene, no todas las que existen. La lista larga que suele venir con
 * estos escáneres (Rust, Swift, Lua, SQL…) sería alcance especulativo: acá nunca matchearía, y cada
 * entrada de más es una sintaxis que nadie ejercita y que igual hay que sostener.
 */
export const SYNTAX_BY_EXTENSION: Readonly<Record<string, CommentSyntax>> = Object.freeze({
	'.ts': C_FAMILY,
	'.tsx': C_FAMILY,
	'.mts': C_FAMILY,
	'.cts': C_FAMILY,
	'.js': C_FAMILY,
	'.jsx': C_FAMILY,
	'.mjs': C_FAMILY,
	'.cjs': C_FAMILY,
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

/** Los comentarios de un archivo, en orden de aparición. */
export function extractComments(file: string, text: string, syntax: CommentSyntax): CommentRecord[] {
	const comments: CommentRecord[] = [];
	let cursor: Cursor = { index: 0, line: 1 };

	while (cursor.index < text.length) {
		const char = text[cursor.index];

		if (char === '\n') {
			cursor = { index: cursor.index + 1, line: cursor.line + 1 };
			continue;
		}
		if (syntax.hasStringLiterals && STRING_DELIMITERS.has(char)) {
			cursor = skipStringLiteral(text, cursor);
			continue;
		}

		const pair = openingBlockPair(text, cursor, syntax.blockPairs);
		if (pair) {
			const { comment, next } = readBlockComment(file, text, cursor, pair);
			comments.push(comment);
			cursor = next;
			continue;
		}

		const prefix = syntax.linePrefixes.find((candidate) => text.startsWith(candidate, cursor.index));
		if (prefix && !isShebang(text, cursor, prefix)) {
			const { comment, next } = readLineComment(file, text, cursor);
			comments.push(comment);
			cursor = next;
			continue;
		}

		cursor = { index: cursor.index + 1, line: cursor.line };
	}

	return comments;
}
