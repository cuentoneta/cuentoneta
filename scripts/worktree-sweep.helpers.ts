/**
 * Núcleo puro del barrido de worktrees: clasifica lo que hay contra lo que git registra, y arma el
 * reporte. Sin I/O ni `child_process`, para poder testearse; el runner le pasa las tres entradas ya
 * recolectadas.
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

/**
 * Los worktrees que declara `git worktree list --porcelain`. El formato son bloques separados por una
 * línea en blanco, con una clave por línea; solo interesan `worktree` (la ruta) y `branch` (la ref).
 * Un worktree en detached HEAD no trae `branch`, y queda con rama vacía.
 */
export function parseWorktreeList(porcelain: string): RegisteredWorktree[] {
	return porcelain
		.split(/\n\s*\n/)
		.map((bloque) => {
			const path = /^worktree (.+)$/m.exec(bloque)?.[1]?.trim();
			const branch = /^branch refs\/heads\/(.+)$/m.exec(bloque)?.[1]?.trim() ?? '';
			return path ? { path: path.replace(/\\/g, '/'), branch } : null;
		})
		.filter((entrada): entrada is RegisteredWorktree => entrada !== null);
}

/**
 * Reparte en activos, mergeados y huérfanos. Un directorio es huérfano cuando existe en disco pero
 * ningún worktree registrado lo reclama — el caso que deja una remoción a medias o un borrado manual
 * del registro.
 */
export function classifyWorktrees(entrada: {
	registered: RegisteredWorktree[];
	directories: string[];
	mergedBranches: string[];
	worktreesRoot: string;
}): WorktreeClassification {
	const mergeadas = new Set(entrada.mergedBranches);
	const reclamados = new Set(entrada.registered.map((worktree) => worktree.path));
	const raiz = `${entrada.worktreesRoot.replace(/\/$/, '')}/`;

	// Solo los worktrees que viven bajo la raíz de worktrees son candidatos. El checkout principal
	// queda afuera por construcción, y hace falta que así sea: los PRs de release van `develop →
	// master`, así que `develop` figura como rama mergeada y sin este filtro el repo entero se
	// propondría para remoción.
	const candidato = (worktree: RegisteredWorktree) => worktree.path.startsWith(raiz);

	return {
		active: entrada.registered.filter((worktree) => !candidato(worktree) || !mergeadas.has(worktree.branch)),
		merged: entrada.registered.filter((worktree) => candidato(worktree) && mergeadas.has(worktree.branch)),
		orphans: entrada.directories.filter((directorio) => !reclamados.has(directorio)),
	};
}

/**
 * El texto que ve el agente. Compacto a propósito: este reporte entra al contexto en **cada** sesión,
 * así que un barrido sin candidatos ocupa una línea.
 */
export function formatSweepReport(
	clasificacion: WorktreeClassification,
	conArtefactos: ReadonlySet<string> = new Set(),
): string {
	const { active, merged, orphans } = clasificacion;
	if (merged.length === 0 && orphans.length === 0) {
		return `worktrees: ${active.length} activos, sin candidatos a limpieza.`;
	}

	const marca = (ruta: string) => (conArtefactos.has(ruta) ? ' [conserva artefactos]' : '');
	const lineas = [
		`worktrees: ${active.length} activos · ${merged.length} con PR mergeado · ${orphans.length} huérfanos.`,
		...merged.map((worktree) => `  mergeado  ${worktree.path} (${worktree.branch})${marca(worktree.path)}`),
		...orphans.map((ruta) => `  huérfano  ${ruta}${marca(ruta)}`),
	];
	return lineas.join('\n');
}
