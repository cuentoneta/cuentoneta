import { EXIT_CODES, type ExitCode, type OpsCatalog, type OpsTaskArgs, type OpsTaskDescriptor } from './registry';

export const NO_DRY_RUN_FLAG = '--no-dry-run';

// El resultado cerrado de leer el argv: pedir el catálogo, rechazar con motivo, o ejecutar una tarea.
// La unión hace irrepresentables las combinaciones inválidas (un id desconocido no lleva args; una
// tarea a ejecutar siempre lleva descriptor y flags ya resueltos).
export type Invocation =
	| Readonly<{ action: 'usage' }>
	| Readonly<{ action: 'reject'; reason: string }>
	| Readonly<{ action: 'execute'; descriptor: OpsTaskDescriptor; args: OpsTaskArgs }>;

export interface DispatchOutput {
	log: (message: string) => void;
	error: (message: unknown) => void;
}

export function resolveInvocation(tasks: OpsCatalog, argv: readonly string[]): Invocation {
	let taskId: string | undefined;
	let firstUnexpected: string | undefined;
	let apply = false;

	for (const arg of argv) {
		if (arg === NO_DRY_RUN_FLAG) {
			apply = true;
			continue;
		}
		if (taskId === undefined) {
			taskId = arg;
			continue;
		}
		firstUnexpected ??= arg;
	}

	if (taskId === undefined) return { action: 'usage' };

	// Object.hasOwn excluye las propiedades heredadas ('toString', 'constructor'): sin ese guard, un id
	// que coincida con el prototipo del objeto resolvería un descriptor falso en vez de rechazarse.
	if (!Object.hasOwn(tasks, taskId)) return { action: 'reject', reason: `Tarea desconocida: ${taskId}` };
	if (firstUnexpected !== undefined) return { action: 'reject', reason: `Argumento desconocido: ${firstUnexpected}` };

	return { action: 'execute', descriptor: tasks[taskId], args: { apply } };
}

export function formatCatalog(tasks: OpsCatalog): readonly string[] {
	const idWidth = Object.keys(tasks).reduce((max, id) => Math.max(max, id.length), 0);
	return Object.entries(tasks).map(([id, task]) => `  ${id.padEnd(idWidth)}  ${task.description}`);
}

function usageText(tasks: OpsCatalog): string {
	return [`Uso: pnpm ops <tarea> [${NO_DRY_RUN_FLAG}]`, '', 'Tareas:', ...formatCatalog(tasks)].join('\n');
}

export async function dispatch(tasks: OpsCatalog, argv: readonly string[], output: DispatchOutput): Promise<ExitCode> {
	const invocation = resolveInvocation(tasks, argv);

	switch (invocation.action) {
		case 'usage':
			output.log(usageText(tasks));
			return EXIT_CODES.success;
		case 'reject':
			output.error(invocation.reason);
			output.log(usageText(tasks));
			return EXIT_CODES.failure;
		case 'execute':
			try {
				const task = await invocation.descriptor.load();
				await task.run(invocation.args);
				return EXIT_CODES.success;
			} catch (error) {
				output.error(error);
				return EXIT_CODES.failure;
			}
	}
}
