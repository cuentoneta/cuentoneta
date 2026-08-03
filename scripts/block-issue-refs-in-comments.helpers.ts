/**
 * Predicado del hook que impide citar issues en comentarios de código (Sección 3 de
 * `coding-agent-policies.md`). Vive aparte del runner para poder testearse: el runner solo lee stdin
 * y traduce el resultado a un código de salida.
 */

/** Solo código, y solo bajo `src/`. La regla rige para todo el repo; el hook cubre esta porción. */
const SCOPED_PATH = /(^|\/)src\//;
const CODE_FILE = /\.(ts|html|css|js|mjs|cjs)$/;

// Dos dígitos y no tres, a diferencia del check de la documentación de agentes: ahí el umbral más alto
// evita confundir un issue con un número de hallazgo de review, que en código no existen.
const ISSUE_REF = /#\d{2,}/;
const COMMENT_MARKER = /\/\/|\/\*|<!--|^\s*\*/;

// Ambas excepciones se anclan a la apertura del comentario: una directiva legítima abre el comentario,
// no aparece en medio de la prosa. Sin el ancla, nombrar un marcador alcanzaba para excusar la línea, y
// `// El eslint-disable de abajo viene de #123` colaba el rationale prohibido de contrabando.
const OPENER = String.raw`(?:\/\/|\/\*|<!--|^\s*\*)\s*`;

// `TODO` como marcador y no como palabra suelta en la prosa: en mayúsculas y seguido de `:` o de `(`.
const TODO_MARKER = new RegExp(`${OPENER}TODO\\s*[:(]`);

// La justificación de una supresión de lint/TS lleva su issue por exigencia de las restricciones duras
// de CLAUDE.md. No es un TODO ni necesita serlo.
const SUPPRESSION_MARKER = new RegExp(`${OPENER}(?:@ts-ignore|@ts-expect-error|eslint-disable)`);

/**
 * Las líneas del texto agregado que citan un issue dentro de un comentario sin ampararse en ninguna de
 * las dos excepciones. Devuelve vacío cuando el archivo queda fuera de alcance.
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
		if (!ISSUE_REF.test(line)) return false;
		if (TODO_MARKER.test(line) || SUPPRESSION_MARKER.test(line)) return false;

		// Quita el `://` para no leer el `//` de una URL como marcador de comentario.
		return COMMENT_MARKER.test(line.replace(/:\/\//g, ':/'));
	});
}
