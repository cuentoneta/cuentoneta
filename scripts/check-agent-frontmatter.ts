/**
 * Valida el frontmatter de `.claude/agents/*.md` y de `.claude/skills/<skill>/SKILL.md`.
 *
 * Un `description:` sin comillas que contenga `: ` (dos puntos + espacio) es YAML inválido: el parser
 * lo lee como un mapping anidado y descarta la definición **sin emitir ningún error**. El agente o la
 * skill simplemente no aparece en el registro de la sesión. Pasó con `documentation-writer` (#1874) y
 * se repitió al editar `security-auditor` (#1849), en ambos casos sin señal alguna.
 *
 * Las skills entran al recorrido porque tienen el mismo frontmatter y el mismo modo de falla, y
 * porque nada más lo verifica: que una skill cargue no se nota hasta que hace falta y no está.
 *
 * Lo consume el runner `check-claude-docs.ts` (gate de CI `check-agents`).
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const CLAUDE_DIR = join(process.cwd(), '.claude');
const REQUIRED_KEYS = ['name', 'description'] as const;

/** Un archivo a validar, con la ruta que se muestra en el reporte. */
interface FrontmatterSource {
	readonly label: string;
	readonly path: string;
}

function frontmatterOf(source: string): string | null {
	const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
	return match ? match[1] : null;
}

/**
 * Los pares clave/valor del frontmatter. Ignora las líneas que no abren una clave —la continuación
 * de un valor multilínea, un ítem de lista— para no leer su contenido como una clave propia.
 */
function entriesOf(frontmatter: string): Map<string, string> {
	const entries = new Map<string, string>();
	for (const line of frontmatter.split(/\r?\n/)) {
		const separator = line.indexOf(':');
		if (separator > 0 && /^[a-zA-Z]/.test(line)) {
			entries.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
		}
	}
	return entries;
}

/**
 * Núcleo puro: devuelve una línea `✗ …` por cada problema del frontmatter de `source`, y vacío si
 * está bien. Separado de la lectura de disco para poder ejercitar cada modo de falla en un spec.
 */
export function checkFrontmatter(label: string, source: string): string[] {
	const frontmatter = frontmatterOf(source);
	if (frontmatter === null) {
		return [`✗ ${label} — no tiene frontmatter delimitado por \`---\``];
	}

	const entries = entriesOf(frontmatter);
	const problems: string[] = [];

	for (const key of REQUIRED_KEYS) {
		if (!entries.has(key)) problems.push(`✗ ${label} — le falta la clave \`${key}\``);
	}
	for (const [key, value] of entries) {
		const unquoted = !/^["'].*["']$/.test(value);
		if (unquoted && value.includes(': ')) {
			problems.push(
				`✗ ${label} — \`${key}\` contiene ": " sin comillas: YAML lo lee como mapping y la definición no carga. Usá un guion (—) o entrecomillá el valor.`,
			);
		}
	}
	return problems;
}

function agentSources(): FrontmatterSource[] {
	const directory = join(CLAUDE_DIR, 'agents');
	if (!existsSync(directory)) {
		return [];
	}
	return readdirSync(directory)
		.filter((file) => file.endsWith('.md'))
		.map((file) => ({ label: `.claude/agents/${file}`, path: join(directory, file) }));
}

function skillSources(): FrontmatterSource[] {
	const directory = join(CLAUDE_DIR, 'skills');
	if (!existsSync(directory)) {
		return [];
	}
	return readdirSync(directory, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => ({
			label: `.claude/skills/${entry.name}/SKILL.md`,
			path: join(directory, entry.name, 'SKILL.md'),
		}))
		.filter((source) => existsSync(source.path));
}

/** Devuelve una línea `✗ …` por cada problema de frontmatter; vacío si están todos bien. */
export function checkAgentFrontmatter(): string[] {
	return [...agentSources(), ...skillSources()].flatMap(({ label, path }) =>
		checkFrontmatter(label, readFileSync(path, 'utf8')),
	);
}
