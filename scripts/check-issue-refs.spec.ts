import { checkIssueRefs, findIssueRefProblems, GOVERNANCE_ISSUE_REFS } from './check-issue-refs';

describe('findIssueRefProblems', () => {
	it('no marca una mención a un puntero de gobernanza declarado', () => {
		expect(
			findIssueRefProblems('.claude/references/angular-state.md', 'No generar NgRx hasta que #1530 cambie.'),
		).toEqual([]);
	});

	it('marca una mención a un issue que no está declarado, con archivo y línea', () => {
		const problems = findIssueRefProblems('.claude/references/testing.md', 'primera\nel stub es temporal (#1494).');

		expect(problems).toHaveLength(1);
		expect(problems[0]).toContain('.claude/references/testing.md:2');
		expect(problems[0]).toContain('#1494');
	});

	it('dice dónde declarar el número cuando el issue está abierto', () => {
		const [problem] = findIssueRefProblems('.claude/agents/plan-writer.md', 'ver #1999');

		expect(problem).toContain('GOVERNANCE_ISSUE_REFS');
		expect(problem).toContain('scripts/check-issue-refs.ts');
	});

	it('ignora los identificadores de hallazgo, que llevan prefijo propio y no `#`', () => {
		expect(findIssueRefProblems('.claude/agents/code-reviewer.md', 'Detectado como R7 durante la review.')).toEqual([]);
		expect(findIssueRefProblems('.claude/agents/security-auditor.md', 'El hallazgo S3 sigue abierto')).toEqual([]);
	});

	it('no deja fuera a los issues de número bajo, que en un proyecto recién clonado son todos', () => {
		expect(findIssueRefProblems('.claude/references/testing.md', 'issue #7')).toHaveLength(1);
		expect(findIssueRefProblems('.claude/references/testing.md', 'issue #99')).toHaveLength(1);
	});

	it('ignora las anclas de Markdown, que no son menciones a un issue', () => {
		expect(
			findIssueRefProblems(
				'.claude/references/angular-components.md',
				'ver [§8](./angular-state.md#8-directivas-de-seo)',
			),
		).toEqual([]);
		expect(findIssueRefProblems('.claude/references/angular-components.md', 'ver [§8](#8-directivas-de-seo)')).toEqual(
			[],
		);
	});

	it('ignora los placeholders textuales, que no llevan número', () => {
		expect(
			findIssueRefProblems('.claude/references/coding-agent-policies.md', 'Formato: `[#<id>] - <mensaje>`'),
		).toEqual([]);
	});

	it('marca cada mención por separado cuando hay varias en la misma línea', () => {
		const problems = findIssueRefProblems('.claude/references/domain-model.md', 'implementado en #1852 y #1853');

		expect(problems).toHaveLength(2);
	});

	it('atrapa el issue citado por URL de GitHub, no solo por su numeral', () => {
		const problems = findIssueRefProblems(
			'.claude/skills/release-workflow/SKILL.md',
			'Ejemplo: `/release-workflow https://github.com/cuentoneta/cuentoneta/issues/1672`',
		);

		expect(problems).toHaveLength(1);
		expect(problems[0]).toContain('#1672');
	});

	it('atrapa también la forma GH-<id>', () => {
		expect(findIssueRefProblems('.claude/agents/code-reviewer.md', 'ver GH-1672')).toHaveLength(1);
	});
});

describe('checkIssueRefs', () => {
	// Ejercita el wiring real —raíz del recorrido, filtro de `worktrees` y normalización de separadores
	// en Windows—, que un spec sobre el núcleo puro no puede cubrir. Si el árbol viola la regla, este
	// test falla con las menciones ofensoras, igual que el gate.
	it('no encuentra menciones no declaradas en el árbol del repo', () => {
		expect(checkIssueRefs()).toEqual([]);
	});
});

describe('GOVERNANCE_ISSUE_REFS', () => {
	it('documenta el motivo de cada puntero declarado', () => {
		const entries = Object.entries(GOVERNANCE_ISSUE_REFS);

		expect(entries.length).toBeGreaterThan(0);
		for (const [number, reason] of entries) {
			expect(Number(number)).toBeGreaterThan(99);
			expect(reason.trim().length).toBeGreaterThan(0);
		}
	});
});
