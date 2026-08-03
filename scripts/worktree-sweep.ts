/**
 * Barrido de worktrees: reporta cuáles quedaron sin uso y, con `--apply`, remueve los que git todavía
 * registra y cuya rama ya mergeó. El criterio y el formato viven en `worktree-sweep.helpers.ts`.
 *
 * **Nunca borra un directorio huérfano.** Los enumera con el comando exacto de borrado para que la
 * acción la ejecute una persona: un huérfano puede conservar el `workspace/<n>/` de una sesión —planes
 * y reviews que nadie más tiene—, y el repo prohíbe borrar artefactos autorados aunque estén
 * gitignoreados. Antes de cualquier remoción, ese directorio se archiva a la raíz.
 *
 * Orden que importa: la clasificación se computa **antes** del `prune`. Después, un huérfano ya no
 * tiene gitdir válido y ningún comando git puede inspeccionarlo.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, renameSync } from 'node:fs';
import { join, resolve } from 'node:path';

import {
	classifyWorktrees,
	formatSweepReport,
	parseWorktreeList,
	type WorktreeClassification,
} from './worktree-sweep.helpers';

function git(...args: string[]): string {
	return execFileSync('git', args, { encoding: 'utf8' });
}

// La raíz sale del repo principal, no del cwd: corrido desde adentro de un worktree, `process.cwd()`
// apunta al worktree y la raíz quedaría en una ruta que no existe — el barrido reportaría cero
// huérfanos siempre. `--git-common-dir` devuelve el `.git` compartido, cuyo padre es el checkout
// principal aunque el comando corra desde cualquier worktree.
const ROOT = resolve(git('rev-parse', '--path-format=absolute', '--git-common-dir').trim(), '..');
const WORKTREES_ROOT = resolve(ROOT, '.claude/worktrees').replace(/\\/g, '/');

/** Los directorios que hay bajo la raíz de worktrees, en el mismo formato de ruta que usa git. */
function listDirectories(): string[] {
	if (!existsSync(WORKTREES_ROOT)) {
		return [];
	}
	return readdirSync(WORKTREES_ROOT, { withFileTypes: true })
		.filter((entrada) => entrada.isDirectory())
		.map((entrada) => join(WORKTREES_ROOT, entrada.name).replace(/\\/g, '/'));
}

/** Las ramas cuyo PR ya mergeó. Sin red disponible devuelve vacío: sin señal no se propone remover nada. */
function mergedBranches(): string[] {
	try {
		const salida = execFileSync('gh', ['pr', 'list', '--state', 'merged', '--json', 'headRefName', '--limit', '100'], {
			encoding: 'utf8',
		});
		return (JSON.parse(salida) as { headRefName: string }[]).map((pr) => pr.headRefName);
	} catch {
		process.stderr.write('aviso: no se pudo consultar los PRs mergeados; se reportan solo los huérfanos.\n');
		return [];
	}
}

/** Las rutas que conservan un `workspace/` no vacío, que es lo que no puede perderse. */
function withArtifacts(rutas: string[]): Set<string> {
	return new Set(
		rutas.filter((ruta) => {
			const workspace = join(ruta, 'workspace');
			return existsSync(workspace) && readdirSync(workspace).length > 0;
		}),
	);
}

/** Mueve el `workspace/` de un worktree a la raíz del repo. No pisa: ante colisión, reporta. */
function archiveArtifacts(ruta: string): void {
	const origen = join(ruta, 'workspace');
	const destino = join(ROOT, `workspace-archivado-${ruta.split('/').pop()}`);
	if (existsSync(destino)) {
		process.stderr.write(`aviso: ya existe ${destino}; no se archiva ${origen}.\n`);
		return;
	}
	renameSync(origen, destino);
	process.stdout.write(`archivado: ${origen} → ${destino}\n`);
}

function apply(clasificacion: WorktreeClassification, conArtefactos: ReadonlySet<string>): void {
	// `prune` solo desregistra worktrees cuyo directorio ya no existe; no toca el disco.
	git('worktree', 'prune');

	for (const worktree of clasificacion.merged) {
		if (conArtefactos.has(worktree.path)) {
			archiveArtifacts(worktree.path);
		}
		try {
			// Sin `--force`: si el árbol tiene cambios sin commitear, git rechaza y se reporta.
			git('worktree', 'remove', worktree.path);
			process.stdout.write(`removido: ${worktree.path}\n`);
		} catch {
			process.stderr.write(`no removido (tiene cambios sin commitear): ${worktree.path}\n`);
		}
	}

	if (clasificacion.orphans.length > 0) {
		process.stdout.write(
			`\nLos ${clasificacion.orphans.length} huérfanos no se borran automáticamente. Para hacerlo:\n` +
				clasificacion.orphans.map((ruta) => `  rm -rf "${ruta}"`).join('\n') +
				'\n',
		);
	}
}

const clasificacion = classifyWorktrees({
	registered: parseWorktreeList(git('worktree', 'list', '--porcelain')),
	directories: listDirectories(),
	mergedBranches: mergedBranches(),
	worktreesRoot: WORKTREES_ROOT,
});
const conArtefactos = withArtifacts([...clasificacion.merged.map((w) => w.path), ...clasificacion.orphans]);

process.stdout.write(`${formatSweepReport(clasificacion, conArtefactos)}\n`);

if (process.argv.includes('--apply')) {
	apply(clasificacion, conArtefactos);
}
