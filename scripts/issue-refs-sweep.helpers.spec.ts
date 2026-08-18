import {
	classifyIssueState,
	collectTrackedRefs,
	decideAction,
	fingerprint,
	formatConsoleReport,
	formatReportBody,
	selectStaleRefs,
	type IssueState,
	type TrackedIssueRef,
} from './issue-refs-sweep.helpers';

const ref = (overrides: Partial<TrackedIssueRef> = {}): TrackedIssueRef => ({
	issueNumber: 1503,
	surface: 'allowlist',
	file: '.claude/references/angular-state.md',
	detail: 'puntero de gobernanza',
	...overrides,
});

describe('collectTrackedRefs', () => {
	it('junta las tres superficies en una sola lista', () => {
		const salida = collectTrackedRefs({
			allowlist: { 1503: 'DDD en código' },
			docs: [{ path: 'a.md', mentions: [{ lineNumber: 3, issueNumber: 1503 }] }],
			code: [{ path: 'src/x.ts', refs: [{ lineNumber: 7, issueNumber: 1471, kind: 'todo' }] }],
		});

		expect(salida.map((r) => r.surface)).toEqual(['allowlist', 'todo']);
		expect(salida[0].file).toBe('a.md');
		expect(salida[1]).toMatchObject({ issueNumber: 1471, lineNumber: 7 });
	});

	it('conserva una entrada de la allowlist que todavía nadie cita', () => {
		const salida = collectTrackedRefs({ allowlist: { 1530: 'NgRx' }, docs: [], code: [] });

		expect(salida).toHaveLength(1);
		expect(salida[0].file).toBe('(sin menciones)');
	});

	it('agrupa en una entrada los varios archivos que citan el mismo puntero', () => {
		const salida = collectTrackedRefs({
			allowlist: { 1503: 'DDD' },
			docs: [
				{ path: 'a.md', mentions: [{ lineNumber: 1, issueNumber: 1503 }] },
				{ path: 'b.md', mentions: [{ lineNumber: 9, issueNumber: 1503 }] },
			],
			code: [],
		});

		expect(salida[0].file).toBe('a.md, b.md');
	});
});

describe('selectStaleRefs', () => {
	it.each([
		['cerrado', 'closed' as IssueState],
		['inexistente, que es una cita rota', 'missing' as IssueState],
		['un PR, cuyo cerrado no significa lo mismo pero igual no es un issue abierto', 'pull-request' as IssueState],
	])('marca como caduca la referencia a un issue %s', (_caso, estado) => {
		expect(selectStaleRefs([ref()], new Map([[1503, estado]]))).toHaveLength(1);
	});

	it('no marca la referencia a un issue abierto', () => {
		expect(selectStaleRefs([ref()], new Map([[1503, 'open']]))).toEqual([]);
	});

	it('no marca nada si el estado se desconoce: sin señal no se acusa', () => {
		expect(selectStaleRefs([ref()], new Map())).toEqual([]);
	});
});

describe('fingerprint', () => {
	it('no depende del orden de entrada', () => {
		const a = ref({ issueNumber: 1 });
		const b = ref({ issueNumber: 2 });

		expect(fingerprint([a, b])).toBe(fingerprint([b, a]));
	});

	it('cambia cuando cambia el conjunto', () => {
		expect(fingerprint([ref()])).not.toBe(fingerprint([ref(), ref({ issueNumber: 9 })]));
	});

	it('distingue dos referencias al mismo issue en archivos distintos', () => {
		expect(fingerprint([ref({ file: 'a.md' })])).not.toBe(fingerprint([ref({ file: 'b.md' })]));
	});
});

describe('decideAction', () => {
	const states = new Map<number, IssueState>([[1503, 'closed']]);

	it('no hace nada si no hay caducas y no hay seguimiento abierto', () => {
		expect(decideAction({ stale: [], states, existing: null })).toEqual({ kind: 'noop' });
	});

	it('avisa que se puede cerrar el seguimiento, pero no lo cierra solo', () => {
		const conHallazgos = decideAction({ stale: [ref()], states, existing: null });
		const salida = decideAction({ stale: [], states, existing: { body: conHallazgos.body ?? '' } });

		expect(salida.kind).toBe('resolved');
		expect(salida.comment).toContain('cerrar');
	});

	it('no avisa sobre un seguimiento que ya no reporta hallazgos', () => {
		expect(decideAction({ stale: [], states, existing: { body: 'un cuerpo sin huella' } })).toEqual({ kind: 'noop' });
	});

	it('crea el seguimiento cuando aparecen caducas y no existe', () => {
		const salida = decideAction({ stale: [ref()], states, existing: null });

		expect(salida.kind).toBe('create');
		expect(salida.body).toContain('#1503');
	});

	it('no escribe nada si el conjunto es el mismo que la corrida anterior', () => {
		const previo = decideAction({ stale: [ref()], states, existing: null });

		expect(decideAction({ stale: [ref()], states, existing: { body: previo.body ?? '' } })).toEqual({ kind: 'noop' });
	});

	it('actualiza cuando el conjunto cambió', () => {
		const previo = decideAction({ stale: [ref()], states, existing: null });
		const salida = decideAction({
			stale: [ref(), ref({ issueNumber: 99 })],
			states,
			existing: { body: previo.body ?? '' },
		});

		expect(salida.kind).toBe('update');
	});
});

describe('formatReportBody', () => {
	it('nombra el estado de cada issue y agrupa por superficie', () => {
		const salida = formatReportBody(
			[ref(), ref({ issueNumber: 1471, surface: 'todo', file: 'src/x.ts', lineNumber: 4, detail: 'TODO' })],
			new Map<number, IssueState>([
				[1503, 'closed'],
				[1471, 'missing'],
			]),
		);

		expect(salida).toContain('### Allowlist de gobernanza');
		expect(salida).toContain('### TODO en comentarios de código');
		expect(salida).toContain('(closed)');
		expect(salida).toContain('(missing)');
		expect(salida).toContain('src/x.ts:4');
	});

	it('omite las secciones sin hallazgos', () => {
		expect(formatReportBody([ref()], new Map([[1503, 'closed']]))).not.toContain('### Supresión');
	});
});

describe('formatConsoleReport', () => {
	it('ocupa una línea cuando no hay caducas', () => {
		expect(formatConsoleReport([], 9)).toBe('menciones a issues: 9 vigentes, ninguna caduca.');
	});

	it('enumera las caducas con su ubicación', () => {
		const salida = formatConsoleReport([ref({ surface: 'todo', file: 'src/x.ts', lineNumber: 4 })], 9);

		expect(salida).toContain('9 vigentes, 1 caducas');
		expect(salida).toContain('#1503 [todo] src/x.ts:4');
	});
});

describe('classifyIssueState', () => {
	it.each([
		['un issue abierto', { state: 'open', isPullRequest: false }, 'open'],
		['un issue cerrado', { state: 'closed', isPullRequest: false }, 'closed'],
		['un número que resuelve a un PR', { state: 'open', isPullRequest: true }, 'pull-request'],
	])('clasifica %s', (_caso, entrada, esperado) => {
		expect(classifyIssueState(entrada)).toBe(esperado);
	});

	it('reconoce el 404 por su código y no por el número del comando', () => {
		const error = 'Command failed: gh api repos/x/y/issues/99999999 --jq {}\ngh: Not Found (HTTP 404)';

		expect(classifyIssueState({ error })).toBe('missing');
	});

	it.each([
		[
			'un límite de tasa sobre un issue cuyo número contiene 404',
			'Command failed: gh api repos/x/y/issues/2404\ngh: API rate limit exceeded',
		],
		['un token sin permisos sobre #404', 'Command failed: gh api repos/x/y/issues/404\ngh: Bad credentials (HTTP 401)'],
		['un fallo de red sobre #1404', 'Command failed: gh api repos/x/y/issues/1404\nerror connecting'],
	])('no confunde con una cita rota %s', (_caso, error) => {
		expect(() => classifyIssueState({ error })).toThrow();
	});
});

describe('decideAction — el aviso de resuelto se da una sola vez', () => {
	const states = new Map<number, IssueState>([[1503, 'closed']]);

	it('avisa y le quita la huella al cuerpo', () => {
		const conHallazgos = decideAction({ stale: [ref()], states, existing: null });
		const salida = decideAction({ stale: [], states, existing: { body: conHallazgos.body ?? '' } });

		expect(salida.kind).toBe('resolved');
		expect(salida.body).not.toContain('<!-- huella:');
	});

	it('no vuelve a avisar en la corrida siguiente', () => {
		const conHallazgos = decideAction({ stale: [ref()], states, existing: null });
		const primero = decideAction({ stale: [], states, existing: { body: conHallazgos.body ?? '' } });
		const segundo = decideAction({ stale: [], states, existing: { body: primero.body ?? '' } });

		expect(segundo).toEqual({ kind: 'noop' });
	});
});

describe('fingerprint — estabilidad', () => {
	it('no cambia porque una mención se corrió de línea', () => {
		const antes = fingerprint([ref({ surface: 'todo', file: 'src/x.ts', lineNumber: 4 })]);
		const despues = fingerprint([ref({ surface: 'todo', file: 'src/x.ts', lineNumber: 40 })]);

		expect(antes).toBe(despues);
	});
});
