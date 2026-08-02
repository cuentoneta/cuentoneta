/**
 * Listado de los `.md` versionados bajo `.claude/`, compartido por los checks del gate `check-agents`.
 *
 * Vive aparte porque es infraestructura de recorrido, no lógica de validación: los checks que lo
 * consumen siguen siendo independientes entre sí. Tenerlo duplicado hacía que un directorio generado
 * nuevo hubiera que sumarlo a `SKIP` en cada copia.
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

// Generados y copias de trabajo: escanear un worktree reporta el estado de otra rama, no el de este
// árbol. Saltear symlinks evita que un enlace colgado de pnpm aborte el recorrido.
const SKIP = new Set(['node_modules', '.git', 'worktrees', 'dist', '.nx', 'coverage']);

export function listClaudeMarkdownFiles(root: string): string[] {
	const walk = (dir: string): string[] =>
		readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
			if (SKIP.has(entry.name) || entry.isSymbolicLink()) return [];
			const path = join(dir, entry.name);
			return entry.isDirectory() ? walk(path) : entry.name.endsWith('.md') ? [path] : [];
		});

	return walk(join(root, '.claude'));
}
