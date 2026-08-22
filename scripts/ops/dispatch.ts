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
	const positional = argv.filter((arg) => arg !== NO_DRY_RUN_FLAG);
	const [taskId, ...unexpected] = positional;
	const [firstUnexpected] = unexpected;

	if (taskId === undefined) return { action: 'usage' };

	// Object.hasOwn excluye las propiedades heredadas ('toString', 'constructor'): sin ese guard, un id
	// que coincida con el prototipo del objeto resolvería un descriptor falso en vez de rechazarse.
	if (!Object.hasOwn(tasks, taskId)) return { action: 'reject', reason: `Tarea desconocida: ${taskId}` };
	if (firstUnexpected !== undefined) return { action: 'reject', reason: `Argumento desconocido: ${firstUnexpected}` };

	return { action: 'execute', descriptor: tasks[taskId], args: { apply: argv.includes(NO_DRY_RUN_FLAG) } };
}

export function formatCatalog(tasks: OpsCatalog): readonly string[] {
	const idWidth = Math.max(...Object.keys(tasks).map((id) => id.length));
	return Object.entries(tasks).map(([id, task]) => `  ${id.padEnd(idWidth)}  ${task.description}`);
}

function usageText(tasks: OpsCatalog): string {
	return [`Uso: pnpm ops <tarea> [${NO_DRY_RUN_FLAG}]`, '', 'Tareas:', ...formatCatalog(tasks)].join('\n');
}

export async function dispatch(tasks: OpsCatalog, argv: readonly string[], output: DispatchOutput): Promise<ExitCode> {
	const invocation = resolveInvocation(tasks, argv);

	if (invocation.action === 'usage') {
		output.log(usageText(tasks));
		return EXIT_CODES.success;
	}
	if (invocation.action === 'reject') {
		output.error(invocation.reason);
		output.log(usageText(tasks));
		return EXIT_CODES.failure;
	}

	try {
		const task = await invocation.descriptor.load();
		await task.run(invocation.args);
		return EXIT_CODES.success;
	} catch (error) {
		output.error(error);
		return EXIT_CODES.failure;
	}
}
