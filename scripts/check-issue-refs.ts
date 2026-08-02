/**
 * Valida las **menciones a issues** en los `.md` bajo `.claude/`.
 *
 * Estos documentos describen la conducta vigente, no su historia: la procedencia vive en git y en los
 * PRs. Las únicas menciones legítimas son las dos excepciones acotadas de `coding-agent-policies.md`
 * Sección 3 — un **puntero de gobernanza** ("no generar X hasta que el issue cambie de estado") y la
 * **justificación de una supresión de lint/TS** enlazada —, ambas sobre issues abiertos. El resto
 * envejece en silencio: #1948 encontró quince menciones a trabajo ya cerrado, cuatro de ellas
 * afirmando un estado ("en review", "sigue pendiente") que el merge había vuelto falso semanas antes.
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
 * Núcleo puro: devuelve una línea `✗ …` por cada mención a un issue que no esté declarada en
 * `GOVERNANCE_ISSUE_REFS`. Exportada para test — `checkIssueRefs()` la aplica sobre el árbol real.
 */
export function findIssueRefProblems(relPath: string, content: string): string[] {
	// Tres formas de nombrar un issue: `#1234`, la URL de GitHub (o `issues/1234` suelto) y `GH-1234`.
	// El umbral de tres dígitos deja pasar los números de hallazgo de review (`#7`, `#2`) que usan los
	// propios ejemplos de los agentes.
	const issueRef = /(?:#|\bGH-|issues\/)(\d{3,})/g;
	const problems: string[] = [];

	content.split('\n').forEach((line, i) => {
		for (const match of line.matchAll(issueRef)) {
			const number = Number(match[1]);
			if (Object.hasOwn(GOVERNANCE_ISSUE_REFS, number)) continue;
			problems.push(
				`✗ ${relPath}:${i + 1} — menciona #${number}, que no es un puntero de gobernanza declarado. ` +
					`Si el trabajo ya cerró, borrá la mención y reescribí la oración para que se sostenga sola; si es ` +
					`un issue abierto que la documentación necesita nombrar, sumalo a GOVERNANCE_ISSUE_REFS ` +
					`(scripts/check-issue-refs.ts) con su motivo.`,
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
