/**
 * Valida el frontmatter de `.claude/agents/*.md`.
 *
 * Un `description:` sin comillas que contenga `: ` (dos puntos + espacio) es YAML inválido: el parser
 * lo lee como un mapping anidado y descarta el agente **sin emitir ningún error**. El agente
 * simplemente no aparece en el registro de la sesión. Pasó con `documentation-writer` (#1874) y se
 * repitió al editar `security-auditor` (#1849), en ambos casos sin señal alguna.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const AGENTS_DIR = join(process.cwd(), '.claude', 'agents');
const REQUIRED_KEYS = ['name', 'description'] as const;

type Problem = { file: string; message: string };

function frontmatterOf(source: string): string | null {
	const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
	return match ? match[1] : null;
}

function checkAgent(file: string): Problem[] {
	const problems: Problem[] = [];
	const frontmatter = frontmatterOf(readFileSync(join(AGENTS_DIR, file), 'utf8'));

	if (frontmatter === null) {
		return [{ file, message: 'no tiene frontmatter delimitado por `---`' }];
	}

	const entries = new Map<string, string>();
	for (const line of frontmatter.split(/\r?\n/)) {
		const separator = line.indexOf(':');
		if (separator > 0 && /^[a-zA-Z]/.test(line)) {
			entries.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
		}
	}

	for (const key of REQUIRED_KEYS) {
		if (!entries.has(key)) {
			problems.push({ file, message: `le falta la clave \`${key}\`` });
		}
	}

	for (const [key, value] of entries) {
		const unquoted = !/^["'].*["']$/.test(value);
		if (unquoted && value.includes(': ')) {
			problems.push({
				file,
				message: `\`${key}\` contiene ": " sin comillas — YAML lo lee como mapping y el agente no carga. Usá un guion (—) o entrecomillá el valor.`,
			});
		}
	}

	return problems;
}

const problems = readdirSync(AGENTS_DIR)
	.filter((file) => file.endsWith('.md'))
	.flatMap(checkAgent);

if (problems.length > 0) {
	for (const { file, message } of problems) {
		console.error(`✗ .claude/agents/${file} — ${message}`);
	}
	console.error(`\n${problems.length} problema(s) de frontmatter. Un agente con frontmatter inválido no carga y nadie se entera.`);
	process.exit(1);
}

console.log(`✓ Frontmatter válido en los ${readdirSync(AGENTS_DIR).filter((f) => f.endsWith('.md')).length} agentes`);
