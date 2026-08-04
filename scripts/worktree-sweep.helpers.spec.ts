import {
	classifyWorktrees,
	formatSweepReport,
	parseWorktreeList,
	sweepMerged,
	type SweepOperations,
} from './worktree-sweep.helpers';

const porcelain = [
	'worktree C:/repo/cuentoneta',
	'HEAD abc123',
	'branch refs/heads/develop',
	'',
	'worktree C:/repo/cuentoneta/.claude/worktrees/2102',
	'HEAD def456',
	'branch refs/heads/feat/2102-algo',
	'',
	'worktree C:/repo/cuentoneta/.claude/worktrees/2103',
	'HEAD 789abc',
	'detached',
	'',
].join('\n');

describe('parseWorktreeList', () => {
	it('devuelve una entrada por bloque, con su ruta y su rama', () => {
		expect(parseWorktreeList(porcelain)).toEqual([
			{ path: 'C:/repo/cuentoneta', branch: 'develop' },
			{ path: 'C:/repo/cuentoneta/.claude/worktrees/2102', branch: 'feat/2102-algo' },
			{ path: 'C:/repo/cuentoneta/.claude/worktrees/2103', branch: '' },
		]);
	});

	it('deja la rama vacía en detached HEAD, que no declara branch', () => {
		expect(parseWorktreeList(porcelain)[2].branch).toBe('');
	});

	it('normaliza los separadores de Windows', () => {
		const salida = parseWorktreeList('worktree C:\\repo\\cuentoneta\nbranch refs/heads/develop\n');

		expect(salida[0].path).toBe('C:/repo/cuentoneta');
	});

	it('devuelve vacío ante una salida vacía', () => {
		expect(parseWorktreeList('')).toEqual([]);
	});
});

describe('classifyWorktrees', () => {
	const registered = [
		{ path: '/w/2102', branch: 'feat/2102-algo' },
		{ path: '/w/2103', branch: 'feat/2103-otro' },
	];

	it('separa activos de mergeados según la rama', () => {
		const salida = classifyWorktrees({
			registered,
			directories: ['/w/2102', '/w/2103'],
			mergedBranches: ['feat/2102-algo'],
			worktreesRoot: '/w',
		});

		expect(salida.merged.map((w) => w.path)).toEqual(['/w/2102']);
		expect(salida.active.map((w) => w.path)).toEqual(['/w/2103']);
	});

	it('marca como huérfano el directorio que ningún worktree registrado reclama', () => {
		const salida = classifyWorktrees({
			registered,
			directories: ['/w/2102', '/w/2103', '/w/1999'],
			mergedBranches: [],
			worktreesRoot: '/w',
		});

		expect(salida.orphans).toEqual(['/w/1999']);
	});

	it('nunca propone remover el checkout principal, aunque su rama figure mergeada', () => {
		// Los PRs de release van `develop → master`, así que `develop` aparece como rama mergeada.
		const salida = classifyWorktrees({
			registered: [{ path: '/repo', branch: 'develop' }, ...registered],
			directories: ['/w/2102', '/w/2103'],
			mergedBranches: ['develop', 'feat/2102-algo'],
			worktreesRoot: '/w',
		});

		expect(salida.merged.map((w) => w.path)).toEqual(['/w/2102']);
		expect(salida.active.map((w) => w.path)).toContain('/repo');
	});

	it('produce tres listas disjuntas', () => {
		const salida = classifyWorktrees({
			registered,
			directories: ['/w/2102', '/w/2103', '/w/1999'],
			mergedBranches: ['feat/2102-algo'],
			worktreesRoot: '/w',
		});
		const todos = [...salida.active, ...salida.merged].map((w) => w.path);

		expect(new Set(todos).size).toBe(todos.length);
		expect(todos).not.toContain('/w/1999');
	});
});

describe('formatSweepReport', () => {
	it('ocupa una sola línea cuando no hay nada que limpiar', () => {
		const salida = formatSweepReport({ active: [{ path: '/w/2103', branch: 'feat/x' }], merged: [], orphans: [] });

		expect(salida).toBe('worktrees: 1 activos, sin candidatos a limpieza.');
	});

	it('enumera los candidatos y marca los que conservan artefactos', () => {
		const salida = formatSweepReport(
			{ active: [], merged: [{ path: '/w/2102', branch: 'feat/2102-algo' }], orphans: ['/w/1999'] },
			new Set(['/w/1999']),
		);

		expect(salida).toContain('mergeado  /w/2102 (feat/2102-algo)');
		expect(salida).toContain('huérfano  /w/1999 [conserva artefactos]');
		expect(salida).not.toContain('/w/2102 (feat/2102-algo) [conserva artefactos]');
	});
});

describe('sweepMerged', () => {
	const base = (): SweepOperations => ({
		hasUncommittedChanges: () => false,
		hasArtifacts: () => false,
		archive: () => null,
		restore: () => undefined,
		remove: () => null,
	});
	const candidato = [{ path: '/w/2102', branch: 'feat/x' }];

	it('remueve el candidato limpio', () => {
		expect(sweepMerged(candidato, base())).toEqual([{ path: '/w/2102', status: 'removed' }]);
	});

	it('no toca un worktree con cambios sin commitear', () => {
		const salida = sweepMerged(candidato, { ...base(), hasUncommittedChanges: () => true });

		expect(salida[0].status).toBe('skipped');
		expect(salida[0].reason).toContain('sin commitear');
	});

	it('no remueve si el rescate de artefactos falla — si no, la única falla del rescate borraría igual', () => {
		let removido = false;
		const salida = sweepMerged(candidato, {
			...base(),
			hasArtifacts: () => true,
			archive: () => 'ya existe el destino',
			remove: () => {
				removido = true;
				return null;
			},
		});

		expect(removido).toBe(false);
		expect(salida[0].status).toBe('skipped');
		expect(salida[0].reason).toContain('artefactos');
	});

	it('devuelve los artefactos a su lugar si la remoción falla después de archivarlos', () => {
		let restaurado = false;
		const salida = sweepMerged(candidato, {
			...base(),
			hasArtifacts: () => true,
			remove: () => 'git rechazó la remoción',
			restore: () => {
				restaurado = true;
			},
		});

		expect(restaurado).toBe(true);
		expect(salida[0].status).toBe('skipped');
	});

	it('no intenta restaurar si nunca archivó', () => {
		let restaurado = false;
		const salida = sweepMerged(candidato, {
			...base(),
			remove: () => 'falló',
			restore: () => {
				restaurado = true;
			},
		});

		expect(restaurado).toBe(false);
		expect(salida[0].reason).toBe('falló');
	});
});

describe('classifyWorktrees — bordes', () => {
	it('nunca propone remover el worktree de la sesión en curso', () => {
		const salida = classifyWorktrees({
			registered: [{ path: '/w/2103', branch: 'feat/x' }],
			directories: ['/w/2103'],
			mergedBranches: ['feat/x'],
			worktreesRoot: '/w',
			currentPath: '/w/2103',
		});

		expect(salida.merged).toEqual([]);
		expect(salida.active.map((w) => w.path)).toEqual(['/w/2103']);
	});

	it('nunca propone remover un detached HEAD: sin rama no hay PR que confirme que el trabajo está a salvo', () => {
		const salida = classifyWorktrees({
			registered: [{ path: '/w/2104', branch: '' }],
			directories: ['/w/2104'],
			mergedBranches: [''],
			worktreesRoot: '/w',
		});

		expect(salida.merged).toEqual([]);
	});
});

describe('formatSweepReport — tope de la consulta', () => {
	it('avisa cuando la consulta de PRs llegó a su tope', () => {
		const salida = formatSweepReport({ active: [], merged: [], orphans: [] }, new Set(), true);

		expect(salida).toContain('tope');
	});
});
