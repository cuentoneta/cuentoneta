/**
 * Núcleo puro del barrido de worktrees: clasifica lo que hay contra lo que git registra, decide qué
 * hacer con cada candidato y arma el reporte. Sin I/O propio — las operaciones se inyectan — para que
 * la secuencia rescatar/remover, que es donde se puede perder trabajo, quede cubierta por tests.
 *
 * El pasivo se acumula solo: cada sesión del flujo de issues crea un worktree y su remoción depende de
 * que alguien reanude ese issue después del merge, que es el caso menos frecuente cuando todo sale
 * bien. Un directorio huérfano no cuesta solo disco — arrastra su propio `node_modules` y una copia
 * del repo que la exploración por patrón vuelve a encontrar.
 */

/** Un worktree tal como lo registra git. */
export interface RegisteredWorktree {
	readonly path: string;
	readonly branch: string;
}

/** El resultado del barrido, en tres listas disjuntas. */
export interface WorktreeClassification {
	/** Registrados en git, con su rama todavía sin mergear. No se tocan. */
	readonly active: RegisteredWorktree[];
	/** Registrados en git, con su rama ya mergeada. Candidatos a `git worktree remove`. */
	readonly merged: RegisteredWorktree[];
	/** Directorios presentes sin registro en git. Solo se enumeran: el borrado es del usuario. */
	readonly orphans: string[];
}

/** Las operaciones con efecto que el runner inyecta. Todas devuelven un error legible, o nada. */
export interface SweepOperations {
	/** Si el worktree tiene cambios que se perderían al removerlo. */
	hasUncommittedChanges(path: string): boolean;
	/** Si conserva artefactos de sesión que hay que rescatar antes de remover. */
	hasArtifacts(path: string): boolean;
	/** Mueve los artefactos afuera. Devuelve un mensaje de error si no pudo. */
	archive(path: string): string | null;
	/** Devuelve los artefactos a su lugar, tras una remoción fallida. */
	restore(path: string): void;
	/** `git worktree remove`. Devuelve un mensaje de error si no pudo. */
	remove(path: string): string | null;
}

/** Qué pasó con cada candidato, para el reporte final. */
export interface SweepOutcome {
	readonly path: string;
	readonly status: 'removed' | 'skipped';
	readonly reason?: string;
}

/**
 * Los worktrees que declara `git worktree list --porcelain`. El formato son bloques separados por una
 * línea en blanco, con una clave por línea; solo interesan `worktree` (la ruta) y `branch` (la ref).
 * Un worktree en detached HEAD no trae `branch`, y queda con rama vacía — nunca se lo propone remover,
 * porque sin rama no hay PR que confirme que su trabajo ya está a salvo.
 */
export function parseWorktreeList(porcelain: string): RegisteredWorktree[] {
	return porcelain
		.split(/\n\s*\n/)
		.map((block) => {
			const path = /^worktree (.+)$/m.exec(block)?.[1]?.trim();
			const branch = /^branch refs\/heads\/(.+)$/m.exec(block)?.[1]?.trim() ?? '';
			return path ? { path: path.replace(/\\/g, '/'), branch } : null;
		})
		.filter((entry): entry is RegisteredWorktree => entry !== null);
}

/**
 * Reparte en activos, mergeados y huérfanos. Un directorio es huérfano cuando existe en disco pero
 * ningún worktree registrado lo reclama — el caso que deja una remoción a medias.
 *
 * Solo son candidatos los worktrees bajo la raíz de worktrees, y nunca el de la sesión en curso. Lo
 * primero saca al checkout principal, que hace falta: los PRs de release van `develop → master`, así
 * que `develop` figura como rama mergeada y sin el filtro el repo entero se propondría para remoción.
 */
export function classifyWorktrees(input: {
	registered: RegisteredWorktree[];
	directories: string[];
	mergedBranches: string[];
	worktreesRoot: string;
	currentPath?: string;
}): WorktreeClassification {
	const merged = new Set(input.mergedBranches);
	const claimed = new Set(input.registered.map((worktree) => worktree.path));
	const root = `${input.worktreesRoot.replace(/\/$/, '')}/`;
	const current = input.currentPath?.replace(/\\/g, '/');

	const isCandidate = (worktree: RegisteredWorktree) =>
		worktree.path.startsWith(root) &&
		worktree.path !== current &&
		worktree.branch !== '' &&
		merged.has(worktree.branch);

	return {
		active: input.registered.filter((worktree) => !isCandidate(worktree)),
		merged: input.registered.filter(isCandidate),
		orphans: input.directories.filter((directory) => !claimed.has(directory) && directory !== current),
	};
}

/**
 * Rescata y remueve, en el orden que no puede perder trabajo:
 *
 * 1. Un worktree con cambios sin commitear no se toca, y se dice por qué.
 * 2. Si conserva artefactos, se archivan **antes** de remover; si el archivado falla, **no se remueve**.
 *    Sin eso, la única situación en que el rescate falla sería también la única en que el borrado
 *    ocurre igual — `git worktree remove` considera limpio un árbol donde solo quedan ignorados.
 * 3. Si la remoción falla después de haber archivado, los artefactos vuelven a su lugar, para que la
 *    reanudación de esa sesión siga encontrándolos.
 */
export function sweepMerged(candidates: RegisteredWorktree[], ops: SweepOperations): SweepOutcome[] {
	return candidates.map(({ path }) => {
		if (ops.hasUncommittedChanges(path)) {
			return { path, status: 'skipped', reason: 'tiene cambios sin commitear' };
		}

		const archived = ops.hasArtifacts(path);
		if (archived) {
			const error = ops.archive(path);
			if (error) {
				return { path, status: 'skipped', reason: `no se pudieron rescatar sus artefactos (${error})` };
			}
		}

		const error = ops.remove(path);
		if (error) {
			if (archived) {
				ops.restore(path);
			}
			return { path, status: 'skipped', reason: error };
		}
		return { path, status: 'removed' };
	});
}

/**
 * El texto que ve el agente. Compacto a propósito: este reporte entra al contexto en **cada** sesión,
 * así que un barrido sin candidatos ocupa una línea.
 */
export function formatSweepReport(
	classification: WorktreeClassification,
	withArtifacts: ReadonlySet<string> = new Set(),
	truncated = false,
): string {
	const { active, merged, orphans } = classification;
	const aviso = truncated ? ' (la consulta de PRs mergeados llegó a su tope: puede faltar alguno)' : '';
	if (merged.length === 0 && orphans.length === 0) {
		return `worktrees: ${active.length} activos, sin candidatos a limpieza.${aviso}`;
	}

	const mark = (path: string) => (withArtifacts.has(path) ? ' [conserva artefactos]' : '');
	return [
		`worktrees: ${active.length} activos · ${merged.length} con PR mergeado · ${orphans.length} huérfanos.${aviso}`,
		...merged.map((worktree) => `  mergeado  ${worktree.path} (${worktree.branch})${mark(worktree.path)}`),
		...orphans.map((path) => `  huérfano  ${path}${mark(path)}`),
	].join('\n');
}
