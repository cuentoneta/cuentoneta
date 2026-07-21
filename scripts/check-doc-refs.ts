/**
 * Valida las **referencias cruzadas** de los `.md` bajo `.claude/`:
 *
 * 1. Toda ancla `](../../CLAUDE.md#seccion)` apunta a un heading real de `CLAUDE.md`, y la profundidad
 *    de `../` corresponde a la ubicación del archivo. (Rompía en #1846.)
 * 2. Toda ruta del repo citada entre backticks (`src/...`, `scripts/...`) existe. (Rompía en #1847.)
 *
 * Lo consume el runner `check-claude-docs.ts` (gate de CI `check-agents`).
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = process.cwd();

// Generados y copias de trabajo: escanear un worktree reporta el estado de otra rama, no el de este
// árbol. `withFileTypes` + saltear symlinks evita que un enlace colgado de pnpm aborte el recorrido.
const SKIP = new Set(['node_modules', '.git', 'worktrees', 'dist', '.nx', 'coverage']);

// Raíces del repo que valen como prefijo de una ruta citada verificable.
const ROOTS = ['src', 'scripts', 'cms', 'tools', 'e2e', 'docs', '.claude', '.github', 'public'];
const rootRe = new RegExp(`^(${ROOTS.join('|')})/`);

// Rutas citadas que legítimamente NO están en un checkout limpio: viven fuera del repo o son
// artefactos generados/gitignoreados. Cada entrada empareja esa ruta y todo lo que cuelgue de ella.
// Al citar una ruta nueva de esta clase, agregala acá con su motivo (si no, el gate la marca — que es
// lo correcto: obliga a distinguir un artefacto generado de un typo).
const ABSENT_BUT_LEGITIMATE = [
	'.claude/projects', // memoria de Claude Code: vive en el home del usuario, nunca en el repo
	'.claude/worktrees', // worktrees de trabajo: gitignoreado, no existe en un checkout limpio
	'tools/author-bios', // salida gitignoreada de scripts/audit/export-authors-bios.ts
	'src/app/environments', // generado por `pnpm run config`; gitignoreado. En CI existe solo porque el job baja el workspace artifact — no dependas de eso para validar la cita
];

const slug = (text: string): string =>
	text
		.trim()
		.toLowerCase()
		.replace(/`/g, '')
		.replace(/[^\p{L}\p{N}\s-]/gu, '')
		.replace(/\s+/g, '-');

function walk(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		if (SKIP.has(entry.name) || entry.isSymbolicLink()) return [];
		const p = join(dir, entry.name);
		return entry.isDirectory() ? walk(p) : entry.name.endsWith('.md') ? [p] : [];
	});
}

function claudeHeadings(): Set<string> {
	return new Set(
		readFileSync(join(ROOT, 'CLAUDE.md'), 'utf8')
			.split('\n')
			.filter((line) => /^#{1,6}\s/.test(line))
			.map((line) => slug(line.replace(/^#{1,6}\s/, ''))),
	);
}

function checkAnchors(file: string, headings: Set<string>): string[] {
	const rel = relative(ROOT, file).replace(/\\/g, '/');
	const problems: string[] = [];
	readFileSync(file, 'utf8')
		.split('\n')
		.forEach((line, i) => {
			for (const m of line.matchAll(/\]\((\.\.\/)+CLAUDE\.md(#[^)\s]*)?\)/g)) {
				const depth = (m[0].match(/\.\.\//g) ?? []).length;
				const expected = relative(ROOT, file).split(sep).length - 1;
				if (depth !== expected) {
					problems.push(`✗ ${rel}:${i + 1} — sube ${depth} niveles a CLAUDE.md, debería subir ${expected}`);
				}
				const anchor = m[2]?.slice(1);
				if (anchor && !headings.has(decodeURIComponent(anchor))) {
					problems.push(`✗ ${rel}:${i + 1} — ancla #${anchor} no existe en CLAUDE.md`);
				}
			}
		});
	return problems;
}

function citedPathIsResolvable(p: string): boolean {
	if (existsSync(join(ROOT, p))) return true;
	return ABSENT_BUT_LEGITIMATE.some((exempt) => p === exempt || p.startsWith(`${exempt}/`));
}

function checkCitedPaths(file: string): string[] {
	const rel = relative(ROOT, file).replace(/\\/g, '/');
	const problems: string[] = [];
	readFileSync(file, 'utf8')
		.split('\n')
		.forEach((line, i) => {
			for (const m of line.matchAll(/`([^`\n]+)`/g)) {
				const cited = m[1].trim();
				if (!rootRe.test(cited) || /[<>*{}|]/.test(cited)) continue; // globs y placeholders no son verificables
				const p = cited.replace(/\/$/, '').split('#')[0];
				if (!citedPathIsResolvable(p)) {
					problems.push(`✗ ${rel}:${i + 1} — ruta citada \`${p}\` no existe`);
				}
			}
		});
	return problems;
}

/** Devuelve una línea `✗ …` por cada ancla rota o ruta inexistente; vacío si está todo bien. */
export function checkDocRefs(): string[] {
	const headings = claudeHeadings();
	return walk(join(ROOT, '.claude')).flatMap((file) => [...checkAnchors(file, headings), ...checkCitedPaths(file)]);
}
