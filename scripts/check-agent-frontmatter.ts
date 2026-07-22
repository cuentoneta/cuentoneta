/**
 * Valida el frontmatter de `.claude/agents/*.md`.
 *
 * Un `description:` sin comillas que contenga `: ` (dos puntos + espacio) es YAML inválido: el parser
 * lo lee como un mapping anidado y descarta el agente **sin emitir ningún error**. El agente
 * simplemente no aparece en el registro de la sesión. Pasó con `documentation-writer` (#1874) y se
 * repitió al editar `security-auditor` (#1849), en ambos casos sin señal alguna.
 *
 * Lo consume el runner `check-claude-docs.ts` (gate de CI `check-agents`).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const AGENTS_DIR = join(process.cwd(), '.claude', 'agents');
const REQUIRED_KEYS = ['name', 'description'] as const;

function frontmatterOf(source: string): string | null {
	const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
	return match ? match[1] : null;
}

function checkAgent(file: string): string[] {
	const label = `.claude/agents/${file}`;
	const frontmatter = frontmatterOf(readFileSync(join(AGENTS_DIR, file), 'utf8'));
	if (frontmatter === null) {
		return [`✗ ${label} — no tiene frontmatter delimitado por \`---\``];
	}

	const entries = new Map<string, string>();
	for (const line of frontmatter.split(/\r?\n/)) {
		const separator = line.indexOf(':');
		if (separator > 0 && /^[a-zA-Z]/.test(line)) {
			entries.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
		}
	}

	const problems: string[] = [];
	for (const key of REQUIRED_KEYS) {
		if (!entries.has(key)) problems.push(`✗ ${label} — le falta la clave \`${key}\``);
	}
	for (const [key, value] of entries) {
		const unquoted = !/^["'].*["']$/.test(value);
		if (unquoted && value.includes(': ')) {
			problems.push(
				`✗ ${label} — \`${key}\` contiene ": " sin comillas: YAML lo lee como mapping y el agente no carga. Usá un guion (—) o entrecomillá el valor.`,
			);
		}
	}
	return problems;
}

/** Devuelve una línea `✗ …` por cada problema de frontmatter; vacío si están todos bien. */
export function checkAgentFrontmatter(): string[] {
	return readdirSync(AGENTS_DIR)
		.filter((file) => file.endsWith('.md'))
		.flatMap(checkAgent);
}
