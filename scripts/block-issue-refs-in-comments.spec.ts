/**
 * Afirma que el runner del hook se ejecuta con `node` a secas, sin loader de TypeScript. La cadena
 * importa con extensión explícita porque ESM la exige; quitar una la deja muerta con
 * `ERR_MODULE_NOT_FOUND` y ningún gate lo notaría, porque el hook no es un gate.
 *
 * Corre el runner como subproceso a propósito: la propiedad bajo prueba es la resolución de módulos
 * del intérprete real. Dentro del proceso de Vitest, Vite resuelve los imports por su cuenta y el
 * spec seguiría verde con la cadena rota.
 */
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const RUNNER = resolve(process.cwd(), 'scripts/block-issue-refs-in-comments.ts');
const FILE = 'src/app/components/widget/widget.component.ts';

function runHook(added: string): { status: number | null; stderr: string } {
	const result = spawnSync(process.execPath, [RUNNER], {
		input: JSON.stringify({ tool_input: { file_path: FILE, content: added } }),
		encoding: 'utf8',
	});

	return { status: result.status, stderr: result.stderr };
}

describe('el runner del hook, ejecutado con `node` puro', () => {
	it('bloquea con código 2 un comentario que cita un issue', () => {
		const { status, stderr } = runHook('// Rediseñado en #1234: antes usaba otra proyección');

		expect(status).toBe(2);
		expect(stderr).toContain('BLOQUEADO');
	});

	it('bloquea un identificador de hallazgo de review, que no tiene excepción', () => {
		expect(runHook('// sin fallback silencioso, según R6').status).toBe(2);
	});

	it('deja pasar un TODO que cita el issue en su misma línea', () => {
		expect(runHook('// TODO(#1234): sacar este puente').status).toBe(0);
	});

	it('deja pasar código sin comentarios ofensivos', () => {
		expect(runHook('const total = items.length;').status).toBe(0);
	});

	it('resuelve su cadena de imports sin loader: un fallo de módulo saldría por acá', () => {
		const { status, stderr } = runHook('const total = items.length;');

		expect(stderr).not.toContain('ERR_MODULE_NOT_FOUND');
		expect(status).not.toBe(1);
	});
});
