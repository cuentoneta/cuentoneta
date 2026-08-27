/**
 * Hook `PreToolUse` de `Edit`/`Write`: impide escribir un comentario de código que cite un issue,
 * salvo las dos excepciones de la Sección 3 de `coding-agent-policies.md` — un `TODO` con el número en
 * su misma línea, y la justificación de una supresión de lint/TS.
 *
 * Es una ayuda local, no un gate: solo ve el texto que la herramienta agrega. Lo ya commiteado, o lo
 * escrito por Bash o por otro editor, queda fuera de su alcance.
 */
import { findIssueRefsInComments } from './block-issue-refs-in-comments.helpers.ts';

const BLOCK_EXIT_CODE = 2;

function main(raw: string): void {
	let payload: {
		tool_input?: { file_path?: string; new_string?: string; content?: string; edits?: { new_string?: string }[] };
	};
	try {
		payload = JSON.parse(raw);
	} catch {
		// Un hook roto no debe frenar el trabajo.
		process.exit(0);
	}

	const toolInput = payload.tool_input ?? {};
	const filePath = String(toolInput.file_path ?? '');
	// `edits[]` cubre las variantes que agrupan varios reemplazos en una sola llamada: sin leerlas, el
	// hook las dejaría pasar en silencio, que es peor que no matchearlas.
	const added = [toolInput.new_string, toolInput.content, ...(toolInput.edits ?? []).map((edit) => edit?.new_string)]
		.filter((chunk): chunk is string => typeof chunk === 'string')
		.join('\n');
	const offending = findIssueRefsInComments(filePath, added);

	if (offending.length === 0) {
		process.exit(0);
	}

	process.stderr.write(
		`BLOQUEADO: estás citando un issue en un comentario de código en '${filePath}'.\n` +
			`La procedencia y el rationale de un cambio van al commit, al PR y al historial de git, no al código.\n` +
			`Regla: Sección 3 de coding-agent-policies.md.\n` +
			`Excepciones: un TODO puede citar el issue que lo destraba en su MISMA línea (// TODO(#<id>): ...),\n` +
			`y la justificación de un @ts-ignore / @ts-expect-error / eslint-disable.\n` +
			`Líneas ofensivas:\n  ${offending.map((line) => line.trim()).join('\n  ')}\n`,
	);
	process.exit(BLOCK_EXIT_CODE);
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => main(raw));
