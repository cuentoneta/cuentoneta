/**
 * Valida las **menciones a issues** en los `.md` bajo `.claude/`.
 *
 * Estos documentos describen la conducta vigente, no su historia: la procedencia vive en git y en los
 * PRs. La única mención legítima es la de un issue **abierto** cuyo número es load-bearing — un
 * puntero de gobernanza ("no generar X hasta que el issue cambie de estado"). El resto envejece en
 * silencio: #1948 encontró quince menciones a trabajo ya cerrado, cuatro de ellas afirmando un estado
 * ("en review", "sigue pendiente") que el merge había vuelto falso semanas antes.
 *
 * El check es **offline y determinista**: en vez de preguntarle a la API de GitHub por el estado de
 * cada número —lo que ataría el gate a la red, al rate limit y a tener `gh` autenticado en local—,
 * exige que toda mención esté en la allowlist de abajo. Borrar una entrada es entonces un acto
 * deliberado y visible en el diff, en vez de una omisión.
 *
 * Lo consume el runner `check-claude-docs.ts` (gate de CI `check-agents`).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();

// Mismo criterio que `check-doc-refs.ts`: un worktree es la copia de otra rama, no de este árbol.
const SKIP = new Set(['node_modules', '.git', 'worktrees', 'dist', '.nx', 'coverage']);

/**
 * Punteros de gobernanza: issues **abiertos** cuyo número la documentación necesita nombrar. Al
 * cerrarse el issue, se borra su entrada acá y se limpian sus menciones en el mismo PR — el gate
 * pasa a marcarlas, que es exactamente lo que se busca.
 */
export const GOVERNANCE_ISSUE_REFS: Readonly<Record<number, string>> = Object.freeze({
	1503: 'DDD en código (3.0.0): el roadmap que la documentación cita como todavía no adoptado',
	1530: 'NgRx Signal Store (3.1.0): prohibición de generar NgRx hasta que el issue cambie de estado',
	1531: 'OpenAPIHono (3.1.0): la misma prohibición para el backend',
});

// Tres dígitos o más: los ejemplos de review citan números de hallazgo (`#7`, `#2`) que no son issues.
const ISSUE_REF = /#(\d{3,})/g;

function walk(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		if (SKIP.has(entry.name) || entry.isSymbolicLink()) return [];
		const p = join(dir, entry.name);
		return entry.isDirectory() ? walk(p) : entry.name.endsWith('.md') ? [p] : [];
	});
}

/**
 * Núcleo puro: devuelve una línea `✗ …` por cada mención a un issue que no sea un puntero de
 * gobernanza declarado. Exportada para test — `checkIssueRefs()` la aplica sobre el árbol real.
 */
export function findIssueRefProblems(relPath: string, content: string): string[] {
	const problems: string[] = [];
	content.split('\n').forEach((line, i) => {
		for (const match of line.matchAll(ISSUE_REF)) {
			const number = Number(match[1]);
			if (number in GOVERNANCE_ISSUE_REFS) continue;
			problems.push(
				`✗ ${relPath}:${i + 1} — menciona #${number}, que no es un puntero de gobernanza declarado. ` +
					`Si el trabajo ya cerró, borrá la mención y reescribí la oración; si es un issue abierto que la ` +
					`documentación necesita nombrar, sumalo a GOVERNANCE_ISSUE_REFS con su motivo.`,
			);
		}
	});
	return problems;
}

/** Devuelve una línea `✗ …` por cada mención a un issue no declarada; vacío si está todo bien. */
export function checkIssueRefs(): string[] {
	return walk(join(ROOT, '.claude')).flatMap((file) =>
		findIssueRefProblems(relative(ROOT, file).replace(/\\/g, '/'), readFileSync(file, 'utf8')),
	);
}
