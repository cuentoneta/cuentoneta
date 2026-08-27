/**
 * Afirma que el runner del hook se ejecuta con `node` a secas, sin loader de TypeScript. La cadena
 * importa con extensión explícita porque ESM la exige; quitar una la deja muerta con
 * `ERR_MODULE_NOT_FOUND` y ningún gate lo notaría, porque el hook no es un gate.
 *
 * Corre el runner como subproceso a propósito: la propiedad bajo prueba es la resolución de módulos
 * del intérprete real. Dentro del proceso de Vitest, Vite resuelve los imports por su cuenta y el
 * spec seguiría verde con la cadena rota.
 *
 * El subproceso hereda el cwd de la raíz del repo, del que depende `isConventionSource` para anclar
 * su allowlist.
 */
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const RUNNER = resolve(process.cwd(), 'scripts/block-issue-refs-in-comments.ts');
const FILE = 'src/app/components/widget/widget.component.ts';
const OFENSIVO = '// Rediseñado en #1234: antes usaba otra proyección';

function run(payload: unknown): { status: number | null; stderr: string } {
	const result = spawnSync(process.execPath, [RUNNER], {
		input: typeof payload === 'string' ? payload : JSON.stringify(payload),
		encoding: 'utf8',
	});

	return { status: result.status, stderr: result.stderr };
}

/** Las tres formas en que las herramientas de edición entregan el texto agregado. */
const payloadDe = {
	write: (added: string) => ({ tool_input: { file_path: FILE, content: added } }),
	edit: (added: string) => ({ tool_input: { file_path: FILE, new_string: added } }),
	multiEdit: (added: string) => ({ tool_input: { file_path: FILE, edits: [{ new_string: added }] } }),
};

describe('el runner del hook, ejecutado con `node` puro', () => {
	it.each([
		['content, la forma de Write', payloadDe.write],
		['new_string, la forma de Edit', payloadDe.edit],
		['edits[], la forma de MultiEdit', payloadDe.multiEdit],
	])('bloquea con código 2 una cita a un issue entregada por %s', (_caso, arma) => {
		const { status, stderr } = run(arma(OFENSIVO));

		expect(status).toBe(2);
		expect(stderr).toContain('BLOQUEADO');
	});

	it('bloquea un identificador de hallazgo de review, que no tiene excepción', () => {
		expect(run(payloadDe.write('// sin fallback silencioso, según R6')).status).toBe(2);
	});

	it('deja pasar un TODO que cita el issue en su misma línea', () => {
		expect(run(payloadDe.write('// TODO(#1234): sacar este puente')).status).toBe(0);
	});

	it('deja pasar código sin comentarios ofensivos', () => {
		expect(run(payloadDe.write('const total = items.length;')).status).toBe(0);
	});

	it('no frena el trabajo ante una entrada que no es JSON', () => {
		expect(run('esto no es json').status).toBe(0);
	});

	it('bloquea por la regla y no por un fallo de módulo, que es el otro modo de salir distinto de cero', () => {
		const { stderr } = run(payloadDe.write(OFENSIVO));

		expect(stderr).not.toContain('ERR_MODULE_NOT_FOUND');
		expect(stderr).toContain('Líneas ofensivas');
	});
});
