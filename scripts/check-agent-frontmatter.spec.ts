import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { agentSourcesIn, checkFrontmatter, skillSourcesIn } from './check-agent-frontmatter';

/** Arma un frontmatter con las líneas dadas, seguido de un cuerpo cualquiera. */
function withFrontmatter(...lines: string[]): string {
	return ['---', ...lines, '---', '', '# Título', ''].join('\n');
}

describe('checkFrontmatter', () => {
	it('acepta un frontmatter con las dos claves requeridas', () => {
		expect(checkFrontmatter('a.md', withFrontmatter('name: ejemplo', 'description: Hace algo puntual.'))).toEqual([]);
	});

	it('rechaza un `: ` sin comillas, que YAML lee como mapping anidado', () => {
		const [problem] = checkFrontmatter(
			'a.md',
			withFrontmatter('name: ejemplo', 'description: Hace algo: en dos partes.'),
		);

		expect(problem).toContain('`description` contiene ": " sin comillas');
	});

	it('acepta el mismo valor entrecomillado', () => {
		expect(
			checkFrontmatter('a.md', withFrontmatter('name: ejemplo', 'description: "Hace algo: en dos partes."')),
		).toEqual([]);
	});

	it('acepta el guion largo, que es la salida recomendada', () => {
		expect(
			checkFrontmatter('a.md', withFrontmatter('name: ejemplo', 'description: Hace algo — en dos partes.')),
		).toEqual([]);
	});

	it('no confunde con un mapping los dos puntos sin espacio', () => {
		// `https://…` es el caso real: dos puntos pegados a la barra, no un separador de YAML.
		expect(
			checkFrontmatter('a.md', withFrontmatter('name: ejemplo', 'description: Documenta https://ejemplo.test.')),
		).toEqual([]);
	});

	it('reporta cada clave requerida que falte', () => {
		expect(checkFrontmatter('a.md', withFrontmatter('name: ejemplo'))).toEqual([
			'✗ a.md — le falta la clave `description`',
		]);
	});

	it('reporta la ausencia de frontmatter en vez de dar el archivo por válido', () => {
		expect(checkFrontmatter('a.md', '# Título\n\nCuerpo sin frontmatter.\n')).toEqual([
			'✗ a.md — no tiene frontmatter delimitado por `---`',
		]);
	});

	it('no lee como clave la continuación de un valor multilínea', () => {
		const source = withFrontmatter('name: ejemplo', 'description: Primera línea', '  y su continuación.');

		expect(checkFrontmatter('a.md', source)).toEqual([]);
	});
});

describe('agentSourcesIn', () => {
	it('toma los `.md` y descarta cualquier otro archivo del directorio', () => {
		expect(agentSourcesIn('raiz', ['code-reviewer.md', 'notas.txt', 'plan-writer.md']).map((s) => s.label)).toEqual([
			'.claude/agents/code-reviewer.md',
			'.claude/agents/plan-writer.md',
		]);
	});
});

describe('skillSourcesIn', () => {
	it('apunta al SKILL.md de cada subdirectorio', () => {
		expect(skillSourcesIn('raiz', ['issue-workflow'])).toEqual([
			{ label: '.claude/skills/issue-workflow/SKILL.md', path: join('raiz', 'issue-workflow', 'SKILL.md') },
		]);
	});

	it('no produce nada cuando no hay subdirectorios', () => {
		// El caso del `.skill` exportado del cliente de escritorio: es un archivo, no una skill.
		expect(skillSourcesIn('raiz', [])).toEqual([]);
	});
});
