/**
 * Valida las **menciones a issues** en los `.md` bajo `.claude/`.
 *
 * Estos documentos describen la conducta vigente, no su historia: la procedencia vive en git y en los
 * PRs. Las únicas menciones legítimas acá son las que admite `coding-agent-policies.md` Sección 3 para
 * la documentación de agentes — un **puntero de gobernanza** ("no generar X hasta que el issue cambie
 * de estado") y la **justificación de una supresión de lint/TS** enlazada —, ambas sobre issues
 * abiertos. (La misma sección admite además, en **comentarios de código**, un `TODO` que cite el issue
 * que lo destraba; eso queda fuera del alcance de este check.) El resto envejece en silencio: un
 * relevamiento encontró quince menciones a trabajo ya cerrado, cuatro de ellas afirmando un estado
 * ("en review", "sigue pendiente") que el merge había vuelto falso semanas antes.
 *
 * El check es **offline y determinista**: en vez de preguntarle a la API de GitHub por el estado de
 * cada número —lo que ataría el gate a la red, al rate limit y a tener `gh` autenticado en local—,
 * exige que toda mención esté en la allowlist de abajo. Borrar una entrada es entonces un acto
 * deliberado y visible en el diff, en vez de una omisión. La contrapartida asumida: el check **no**
 * detecta que un issue allowlisteado se cerró; eso depende de quien lo cierre.
 *
 * El alcance es **todos** los `.md` versionados bajo `.claude/`, un superconjunto de los tres
 * directorios que nombra la Sección 3 (`references/`, `agents/`, `skills/`): un `.md` nuevo en otra
 * carpeta de config queda cubierto sin tener que acordarse de sumarlo.
 *
 * Lo consume el runner `check-claude-docs.ts` (gate de CI `check-agents`).
 */
import { readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { listClaudeMarkdownFiles } from './claude-docs-tree';
// El criterio de qué es un identificador de hallazgo —y el porqué— viven en `finding-refs.ts`.
import { matchFindingRefs } from './finding-refs';

const ROOT = process.cwd();

/**
 * Issues **abiertos** cuyo número la documentación necesita nombrar, por una de las dos excepciones
 * de la Sección 3. Al cerrarse uno, se borra su entrada acá y se limpian sus menciones en el mismo
 * PR — el gate pasa a marcarlas, que es exactamente lo que se busca.
 */
export const GOVERNANCE_ISSUE_REFS: Readonly<Record<number, string>> = Object.freeze({
	1503: 'DDD en código (3.0.0): el roadmap que la documentación cita como todavía no adoptado',
	1530: 'NgRx Signal Store (3.1.0): prohibición de generar NgRx hasta que el issue cambie de estado',
	1531: 'OpenAPIHono (3.1.0): la misma prohibición para el backend',
});

/**
 * Los archivos que **definen** la convención de prefijos y por eso necesitan nombrarlos. Cualquier otro
 * `.md` de `.claude/` que cite un identificador lo está usando como referencia, que es lo que se busca
 * evitar. Se declaran por ruta y no por patrón: sumar uno debe ser una decisión visible en el diff.
 */
const FINDING_CONVENTION_DOCS: ReadonlySet<string> = new Set([
	'.claude/agents/code-reviewer.md',
	'.claude/agents/security-auditor.md',
	'.claude/references/coding-agent-policies.md',
	'.claude/skills/issue-workflow/SKILL.md',
]);

/**
 * Núcleo puro: devuelve una línea `✗ …` por cada mención a un issue que no esté declarada en
 * `GOVERNANCE_ISSUE_REFS`, y por cada identificador de hallazgo fuera de los archivos que definen la
 * convención. Exportada para test — `checkIssueRefs()` la aplica sobre el árbol real.
 */
/** Una mención a un issue en la documentación de agentes, con la línea donde aparece. */
export interface IssueMention {
	readonly lineNumber: number;
	readonly issueNumber: number;
}

/**
 * Las menciones a issues de un documento, estén o no declaradas en la allowlist.
 *
 * Separada del check porque tiene un segundo consumidor: el sweep programado que verifica si los
 * issues declarados siguen abiertos necesita saber **qué archivos** mencionan cada entrada, y esa es
 * una consulta de red que el gate no puede hacer sin dejar de ser determinista.
 */
export function findIssueMentions(content: string): IssueMention[] {
	// Tres formas de nombrar un issue: `#1234`, la URL de GitHub (o `issues/1234` suelto) y `GH-1234`.
	// Sin umbral de dígitos: los hallazgos de review llevan prefijo (`R1`, `S1`), así que `#` no es
	// ambiguo y los issues de número bajo no quedan fuera del check. Lo que sí hay que excluir son las
	// anclas de Markdown (`angular-state.md#8-directivas-…`, `](#8-…)`): el umbral viejo las tapaba de
	// casualidad. Se descartan por sus bordes — un ancla cuelga de una ruta y sigue con el slug.
	const issueRef = /(?:(?<![\w./])#|\bGH-|issues\/)(\d+)(?![-\w])/g;

	return content
		.split('\n')
		.flatMap((line, i) =>
			[...line.matchAll(issueRef)].map((match) => ({ lineNumber: i + 1, issueNumber: Number(match[1]) })),
		);
}

export function findIssueRefProblems(relPath: string, content: string): string[] {
	const problems: string[] = [];
	const mentionsByLine = new Map<number, number[]>();
	for (const { lineNumber, issueNumber } of findIssueMentions(content)) {
		mentionsByLine.set(lineNumber, [...(mentionsByLine.get(lineNumber) ?? []), issueNumber]);
	}

	content.split('\n').forEach((line, i) => {
		for (const number of mentionsByLine.get(i + 1) ?? []) {
			if (Object.hasOwn(GOVERNANCE_ISSUE_REFS, number)) continue;
			problems.push(
				`✗ ${relPath}:${i + 1} — menciona #${number}, que no es un puntero de gobernanza declarado. ` +
					`Si el trabajo ya cerró, borrá la mención y reescribí la oración para que se sostenga sola; si es ` +
					`un issue abierto que la documentación necesita nombrar, sumalo a GOVERNANCE_ISSUE_REFS ` +
					`(scripts/check-issue-refs.ts) con su motivo.`,
			);
		}
		if (FINDING_CONVENTION_DOCS.has(relPath)) return;

		for (const id of matchFindingRefs(line)) {
			problems.push(
				`✗ ${relPath}:${i + 1} — menciona ${id}, un identificador de hallazgo de review. ` +
					`Son efímeros: viven en workspace/ (gitignoreado) y mueren con la sesión que los emitió. ` +
					`Escribí lo que el hallazgo enseñó —qué invariante se sostiene y por qué—, sin nombrarlo.`,
			);
		}
	});

	return problems;
}

/** Devuelve una línea `✗ …` por cada mención a un issue no declarada; vacío si está todo bien. */
export function checkIssueRefs(): string[] {
	return listClaudeMarkdownFiles(ROOT).flatMap((file) =>
		findIssueRefProblems(relative(ROOT, file).replace(/\\/g, '/'), readFileSync(file, 'utf8')),
	);
}
