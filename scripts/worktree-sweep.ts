/**
 * Barrido de worktrees: reporta cuáles quedaron sin uso y, con `--apply`, remueve los que git todavía
 * registra y cuya rama ya mergeó. El criterio, la decisión y el formato viven en
 * `worktree-sweep.helpers.ts`; acá solo están las operaciones con efecto.
 *
 * **Nunca borra un directorio huérfano.** Los enumera con el comando exacto de borrado para que la
 * acción la ejecute una persona: un huérfano puede conservar el `workspace/<n>/` de una sesión —planes
 * y reviews que nadie más tiene—, y el repo prohíbe borrar artefactos autorados aunque estén
 * gitignoreados.
 *
 * Orden que importa: la clasificación se computa **antes** del `prune`. Después, un huérfano ya no
 * tiene gitdir válido y ningún comando git puede inspeccionarlo.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, renameSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

import {
	classifyWorktrees,
	formatSweepReport,
	parseWorktreeList,
	sweepMerged,
	type SweepOperations,
} from './worktree-sweep.helpers';

const MERGED_PR_LIMIT = 300;

function git(...args: string[]): string {
	return execFileSync('git', args, { encoding: 'utf8' });
}

// La raíz sale del repo principal, no del cwd: corrido desde adentro de un worktree, `process.cwd()`
// apunta al worktree y la raíz quedaría en una ruta que no existe — el barrido reportaría cero
// huérfanos siempre. `--git-common-dir` devuelve el `.git` compartido, cuyo padre es el checkout
// principal aunque el comando corra desde cualquier worktree.
const ROOT = resolve(git('rev-parse', '--path-format=absolute', '--git-common-dir').trim(), '..');
const WORKTREES_ROOT = resolve(ROOT, '.claude/worktrees').replace(/\\/g, '/');
const ARCHIVE_ROOT = join(ROOT, 'workspace-archivado');

/** Los directorios que hay bajo la raíz de worktrees, en el mismo formato de ruta que usa git. */
function listDirectories(): string[] {
	if (!existsSync(WORKTREES_ROOT)) {
		return [];
	}
	return readdirSync(WORKTREES_ROOT, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => join(WORKTREES_ROOT, entry.name).replace(/\\/g, '/'));
}

/** Las ramas cuyo PR ya mergeó, y si la consulta llegó a su tope. Sin red, no se propone remover nada. */
function mergedBranches(): { branches: string[]; truncated: boolean } {
	try {
		const output = execFileSync(
			'gh',
			['pr', 'list', '--state', 'merged', '--json', 'headRefName', '--limit', String(MERGED_PR_LIMIT)],
			{ encoding: 'utf8' },
		);
		const parsed = JSON.parse(output) as { headRefName: string }[];
		return { branches: parsed.map((pr) => pr.headRefName), truncated: parsed.length === MERGED_PR_LIMIT };
	} catch {
		process.stderr.write('aviso: no se pudo consultar los PRs mergeados; se reportan solo los huérfanos.\n');
		return { branches: [], truncated: false };
	}
}

function artifactsPath(worktree: string): string {
	return join(worktree, 'workspace');
}

function archivePath(worktree: string): string {
	return join(ARCHIVE_ROOT, basename(worktree));
}

const operations: SweepOperations = {
	hasUncommittedChanges(path) {
		try {
			return git('-C', path, 'status', '--porcelain').trim().length > 0;
		} catch {
			// Un worktree que git no puede inspeccionar no se toca.
			return true;
		}
	},
	hasArtifacts(path) {
		const artifacts = artifactsPath(path);
		return existsSync(artifacts) && readdirSync(artifacts).length > 0;
	},
	archive(path) {
		const destination = archivePath(path);
		if (existsSync(destination)) {
			return `ya existe ${destination}`;
		}
		try {
			mkdirSync(ARCHIVE_ROOT, { recursive: true });
			renameSync(artifactsPath(path), destination);
			return null;
		} catch (error) {
			return error instanceof Error ? error.message : String(error);
		}
	},
	restore(path) {
		try {
			renameSync(archivePath(path), artifactsPath(path));
		} catch {
			process.stderr.write(`aviso: los artefactos de ${path} quedaron en ${archivePath(path)}.\n`);
		}
	},
	remove(path) {
		try {
			// Sin `--force`: si el árbol tiene algo que se perdería, git rechaza y se reporta.
			git('worktree', 'remove', path);
			return null;
		} catch (error) {
			return error instanceof Error ? error.message.split('\n')[0] : String(error);
		}
	},
};

const { branches, truncated } = mergedBranches();
const classification = classifyWorktrees({
	registered: parseWorktreeList(git('worktree', 'list', '--porcelain')),
	directories: listDirectories(),
	mergedBranches: branches,
	worktreesRoot: WORKTREES_ROOT,
	currentPath: process.cwd().replace(/\\/g, '/'),
});
const withArtifacts = new Set(
	[...classification.merged.map((worktree) => worktree.path), ...classification.orphans].filter((path) =>
		operations.hasArtifacts(path),
	),
);

process.stdout.write(`${formatSweepReport(classification, withArtifacts, truncated)}\n`);

if (process.argv.includes('--apply')) {
	// `prune` solo desregistra worktrees cuyo directorio ya no existe; no toca el disco.
	git('worktree', 'prune');

	for (const outcome of sweepMerged(classification.merged, operations)) {
		const detalle = outcome.status === 'removed' ? 'removido' : `no removido — ${outcome.reason}`;
		process.stdout.write(`${detalle}: ${outcome.path}\n`);
	}

	if (classification.orphans.length > 0) {
		process.stdout.write(
			`\nLos ${classification.orphans.length} huérfanos no se borran automáticamente. Para hacerlo:\n` +
				classification.orphans.map((path) => `  rm -rf "${path}"`).join('\n') +
				'\n',
		);
	}
}
