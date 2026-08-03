/**
 * Definición única de qué es un **identificador de hallazgo de review**: `R<n>` para los del
 * `code-reviewer` y `S<n>` para los del `security-auditor`.
 *
 * Son **efímeros**: viven en `workspace/`, que está gitignoreado, y mueren con la sesión que los
 * emitió. Citarlos en un artefacto durable —un comentario, un mensaje de commit, el cuerpo de un PR—
 * deja una referencia que no resuelve a ninguna parte. Es peor que un número de issue, que al menos
 * apunta a una URL permanente.
 *
 * El conjunto de prefijos es **cerrado** (`R` y `S`, ningún otro) y por eso se puede enumerar. Agregar
 * una letra sin actualizar este módulo deja ciegos a todos sus consumidores a la vez, que es
 * justamente la propiedad por la que la definición vive en un solo lugar.
 *
 * El costo asumido son los nombres de producto homónimos —`R2` y `S3` son almacenamiento—: se los
 * nombra por su producto ("el bucket de Cloudflare") en vez de por su sigla. Exigir una palabra de
 * contexto para desambiguarlos sería una segunda definición, más laxa, y dejaría pasar el caso
 * central: un `R2` pelado, que es la cita más huérfana de todas.
 */

/**
 * El patrón, construido en cada llamada a propósito. Una regex con flag `g` compartida a nivel de
 * módulo arrastra `lastIndex` entre invocaciones y devuelve resultados alternados.
 */
function findingRefPattern(global: boolean): RegExp {
	return new RegExp(String.raw`\b[RS]\d+\b`, global ? 'g' : '');
}

/** Si la línea cita al menos un identificador de hallazgo. */
export function hasFindingRef(line: string): boolean {
	return findingRefPattern(false).test(line);
}

/** Los identificadores citados en la línea, en orden de aparición; vacío si no hay ninguno. */
export function matchFindingRefs(line: string): string[] {
	return [...line.matchAll(findingRefPattern(true))].map((match) => match[0]);
}

/** Una línea de texto que cita identificadores, con su posición (1-indexada) y cuáles cita. */
export interface FindingRefLine {
	readonly lineNumber: number;
	readonly line: string;
	readonly ids: readonly string[];
}

/**
 * Las líneas de un texto libre que citan identificadores de hallazgo.
 *
 * A diferencia del hook de comentarios, no exige marcador de comentario ni aplica excepciones: en un
 * mensaje de commit o en el cuerpo de un PR todo el texto es prosa, y las excepciones de la Sección 3
 * de `coding-agent-policies.md` amparan la cita de un issue, nunca la de un hallazgo.
 */
export function findFindingRefLines(text: string): FindingRefLine[] {
	return text.split(/\r?\n/).flatMap((line, index) => {
		const ids = matchFindingRefs(line);
		return ids.length > 0 ? [{ lineNumber: index + 1, line, ids }] : [];
	});
}
