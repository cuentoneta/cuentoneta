/**
 * Gate de CI `check-agents`: valida la integridad de la config de `.claude/` y de los autodocs.
 *
 * Corre los cuatro checks y **agrega todos los fallos** en una sola pasada, en vez de encadenarlos con
 * `&&` (que cortaría en el primero y daría feedback parcial). Cada check es un fallo silencioso o una
 * desincronización que se descubrió de a uno, por separado; acá quedan enforceados juntos.
 */
import { checkAgentFrontmatter } from './check-agent-frontmatter';
import { checkDocRefs } from './check-doc-refs';
import { checkIssueRefs } from './check-issue-refs';
import { checkStoryDocs } from './check-story-docs';

const problems = [...checkAgentFrontmatter(), ...checkDocRefs(), ...checkIssueRefs(), ...checkStoryDocs()];

if (problems.length > 0) {
	for (const problem of problems) console.error(problem);
	console.error(
		`\n${problems.length} problema(s) en la config de .claude/ o en los autodocs. Cada uno es un fallo que no emite señal por sí solo.`,
	);
	process.exit(1);
}

console.log(
	'✓ Config de .claude/ válida y autodocs sin referencias colgadas: frontmatter de agentes, anclas a CLAUDE.md, rutas citadas, menciones a issues, nombres de componente y enlaces de stories.',
);
