/**
 * Predicado del hook que impide citar issues en comentarios de código (Sección 3 de
 * `coding-agent-policies.md`). Vive aparte del runner para poder testearse: el runner solo lee stdin
 * y traduce el resultado a un código de salida.
 */
// El criterio de qué es un identificador de hallazgo —y el porqué— viven en `finding-refs.ts`, que es
// su definición única.
import { hasFindingRef } from './finding-refs';

/**
 * Solo código, y solo bajo `src/` o `cms/`. La regla rige para todo el repo; el hook cubre esa porción.
 * `cms/` es un proyecto pnpm aparte y no tiene `src/`: sus archivos cuelgan de la raíz del directorio.
 */
const SCOPED_PATH = /(^|\/)(src|cms)\//;
const CODE_FILE = /\.(ts|tsx|html|css|js|jsx|mjs|cjs)$/;

// Sin umbral de dígitos: `#` significa issue y nada más. Los hallazgos de review llevan prefijo (`R1`,
// `S1`) justamente para no obligar a este check a ignorar los issues de número bajo, que en un proyecto
// recién clonado a partir de este son todos los que hay.
const ISSUE_REF = /#\d+/;
const COMMENT_MARKER = /\/\/|\/\*|<!--|^\s*\*/;

// Ambas excepciones se anclan a la apertura del comentario: una directiva legítima abre el comentario,
// no aparece en medio de la prosa. Sin el ancla, nombrar un marcador alcanzaba para excusar la línea, y
// `// El eslint-disable de abajo viene de #<id>` colaba el rationale prohibido de contrabando.
const OPENER = String.raw`(?:\/\/|\/\*|<!--|^\s*\*)\s*`;

// `TODO` como marcador y no como palabra suelta en la prosa: en mayúsculas y seguido de `:` o de `(`.
const TODO_MARKER = new RegExp(`${OPENER}TODO\\s*[:(]`);

// La justificación de una supresión de lint/TS lleva su issue por exigencia de las restricciones duras
// de CLAUDE.md. No es un TODO ni necesita serlo.
const SUPPRESSION_MARKER = new RegExp(`${OPENER}(?:@ts-ignore|@ts-expect-error|eslint-disable)`);

/**
 * Las líneas del texto agregado que citan un issue —o un identificador de hallazgo de review— dentro de
 * un comentario sin ampararse en ninguna de las dos excepciones. Devuelve vacío cuando el archivo queda
 * fuera de alcance.
 *
 * El criterio se evalúa **por línea** a propósito: admitir el número en cualquier parte de un bloque
 * que en alguna línea diga `TODO` volvería la excepción trivial de eludir.
 */
export function findIssueRefsInComments(filePath: string, added: string): string[] {
	const normalized = filePath.replace(/\\/g, '/');
	if (!SCOPED_PATH.test(normalized) || !CODE_FILE.test(normalized)) {
		return [];
	}

	return added.split(/\r?\n/).filter((line) => {
		const citesFinding = hasFindingRef(line);
		if (!ISSUE_REF.test(line) && !citesFinding) return false;

		// Las excepciones amparan la cita de un issue, nunca la de un hallazgo: no hay `TODO` que un
		// identificador muerto pueda destrabar.
		if (!citesFinding && (TODO_MARKER.test(line) || SUPPRESSION_MARKER.test(line))) return false;

		// Quita el `://` para no leer el `//` de una URL como marcador de comentario.
		return COMMENT_MARKER.test(line.replace(/:\/\//g, ':/'));
	});
}

/** Una mención a un issue que alguna de las dos excepciones ampara, con la excepción que la ampara. */
export interface ExemptIssueRef {
	readonly lineNumber: number;
	readonly line: string;
	readonly issueNumber: number;
	readonly kind: 'todo' | 'suppression';
}

/**
 * La operación **inversa** de `findIssueRefsInComments`: las menciones que las excepciones sí admiten.
 *
 * Existe porque esas excepciones se conceden bajo una condición que ningún check verifica — que el
 * issue citado siga **abierto**—. Es una propiedad temporal: se vuelve falsa sin que nadie toque el
 * repositorio, así que solo puede comprobarse preguntándole a GitHub, fuera del camino de un gate.
 *
 * Comparte los mismos marcadores que el predicado del hook, para que ampare exactamente lo mismo.
 */
export function findExemptIssueRefs(filePath: string, content: string): ExemptIssueRef[] {
	const normalized = filePath.replace(/\\/g, '/');
	if (!SCOPED_PATH.test(normalized) || !CODE_FILE.test(normalized)) {
		return [];
	}

	return content.split(/\r?\n/).flatMap((line, index) => {
		// Un hallazgo de review no se ampara nunca, así que su línea tampoco cuenta como excepción.
		if (hasFindingRef(line)) return [];
		if (!COMMENT_MARKER.test(line.replace(/:\/\//g, ':/'))) return [];

		const kind = TODO_MARKER.test(line) ? 'todo' : SUPPRESSION_MARKER.test(line) ? 'suppression' : null;
		if (kind === null) return [];

		// Variante global construida por llamada: una con `g` a nivel de módulo arrastra `lastIndex`
		// entre invocaciones y devuelve resultados alternados.
		const matches = [...line.matchAll(new RegExp(ISSUE_REF.source, 'g'))];
		return matches.map((match) => ({
			lineNumber: index + 1,
			line,
			issueNumber: Number(match[0].slice(1)),
			kind,
		}));
	});
}
