/**
 * Gate de CI `check-agents`: valida la integridad de la config de `.claude/`.
 *
 * Corre los tres checks y **agrega todos los fallos** en una sola pasada, en vez de encadenarlos con
 * `&&` (que cortaría en el primero y daría feedback parcial). Cada check es un fallo silencioso o una
 * desincronización que el epic #1843 encontró de a uno; acá quedan enforceados juntos.
 */
import { checkAgentFrontmatter } from './check-agent-frontmatter';
import { checkDocRefs } from './check-doc-refs';

const problems = [...checkAgentFrontmatter(), ...checkDocRefs()];

if (problems.length > 0) {
	for (const problem of problems) console.error(problem);
	console.error(
		`\n${problems.length} problema(s) en la config de .claude/. Cada uno es un fallo que no emite señal por sí solo.`,
	);
	process.exit(1);
}

console.log('✓ Config de .claude/ válida: frontmatter de agentes, anclas a CLAUDE.md y rutas citadas.');
