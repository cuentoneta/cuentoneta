import { findIssueRefProblems, GOVERNANCE_ISSUE_REFS } from './check-issue-refs';

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

	it('ignora los números de hallazgo de review, que no son issues', () => {
		expect(findIssueRefProblems('.claude/agents/code-reviewer.md', 'Detectado como #7 durante la review.')).toEqual([]);
		expect(findIssueRefProblems('.claude/skills/issue-workflow/SKILL.md', 'Arregla el hallazgo #2')).toEqual([]);
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

	it('declara los tres punteros de gobernanza vigentes con su motivo', () => {
		expect(Object.keys(GOVERNANCE_ISSUE_REFS)).toEqual(['1503', '1530', '1531']);
		for (const reason of Object.values(GOVERNANCE_ISSUE_REFS)) expect(reason.length).toBeGreaterThan(0);
	});
});
