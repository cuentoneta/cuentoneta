/**
 * Verifica que un texto durable —un mensaje de commit o el cuerpo de un PR— no cite identificadores de
 * hallazgo de review. El criterio vive en `finding-refs.ts`; acá solo se lee la entrada y se traduce el
 * resultado a un código de salida.
 *
 * Lee de un **archivo** cuando recibe una ruta (git le pasa el suyo al hook `commit-msg`) o de **stdin**
 * cuando no (el job de CI). Una entrada ilegible **falla ruidoso**: a diferencia del hook `PreToolUse`
 * de Claude Code, que sale 0 ante un payload roto para no frenar el trabajo, un check que no pudo leer
 * lo que debía verificar no verificó nada y no puede reportarse verde.
 */
import { readFileSync } from 'node:fs';
import { text } from 'node:stream/consumers';

import { findFindingRefLines } from './finding-refs';
import { EXIT_CODES, type ExitCode, type OpsTask } from './ops/registry';

const SURFACE_LABELS = Object.freeze({
	commit: 'el mensaje de commit',
	pr: 'el cuerpo del PR',
});

type Surface = keyof typeof SURFACE_LABELS;

function parseSurface(args: readonly string[]): Surface {
	const flag = args.find((arg) => arg.startsWith('--surface='))?.slice('--surface='.length);
	if (flag !== 'commit' && flag !== 'pr') {
		throw new Error(`--surface debe ser 'commit' o 'pr'; se recibió ${flag ?? 'nada'}.`);
	}
	return flag;
}

function report(surface: Surface, offending: ReturnType<typeof findFindingRefLines>): void {
	const ids = [...new Set(offending.flatMap((entry) => entry.ids))].join(', ');

	process.stderr.write(
		`✗ ${SURFACE_LABELS[surface]} cita identificadores de hallazgo de review: ${ids}.\n\n` +
			offending.map((entry) => `  línea ${entry.lineNumber}: ${entry.line.trim()}`).join('\n') +
			`\n\nSon efímeros: viven en workspace/ (gitignoreado) y mueren con la sesión que los emitió, así que\n` +
			`en la historia del repo no resuelven a nada. Describí el cambio real en su lugar:\n` +
			`  ✅ Acota la constante al cuerpo de la función — estaba a nivel de módulo\n` +
			`  ❌ Arregla el hallazgo que marcó la review\n`,
	);
}

function main(input: string, args: readonly string[]): ExitCode | void {
	const surface = parseSurface(args);
	const offending = findFindingRefLines(input);

	if (offending.length === 0) {
		return;
	}

	report(surface, offending);
	// El código de salida y no `process.exit()`: salir de inmediato puede truncar lo recién escrito a
	// stderr cuando es un pipe, que es justamente el caso en CI.
	return EXIT_CODES.failure;
}

export const task: OpsTask = {
	run: async ({ argv }) => {
		const filePath = argv.find((arg) => !arg.startsWith('--'));
		const input = filePath === undefined ? await text(process.stdin) : readFileSync(filePath, 'utf8');
		return main(input, argv);
	},
};
