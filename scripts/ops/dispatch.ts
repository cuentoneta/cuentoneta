import type { OpsTaskDescriptor } from './registry';

export const NO_DRY_RUN_FLAG = '--no-dry-run';

export interface ParsedInvocation {
	readonly taskId: string | null;
	readonly apply: boolean;
	readonly unknownArgs: readonly string[];
}

export interface DispatchOutput {
	log: (message: string) => void;
	error: (message: unknown) => void;
}

export function parseInvocation(argv: readonly string[]): ParsedInvocation {
	const positional = argv.filter((arg) => arg !== NO_DRY_RUN_FLAG);
	const [taskId, ...extra] = positional;
	return {
		taskId: taskId ?? null,
		apply: argv.includes(NO_DRY_RUN_FLAG),
		unknownArgs: extra,
	};
}

export function formatCatalog(tasks: Readonly<Record<string, OpsTaskDescriptor>>): readonly string[] {
	const idWidth = Math.max(...Object.keys(tasks).map((id) => id.length));
	return Object.entries(tasks).map(([id, task]) => `  ${id.padEnd(idWidth)}  ${task.description}`);
}

function printUsage(tasks: Readonly<Record<string, OpsTaskDescriptor>>, output: DispatchOutput): void {
	output.log(`Uso: pnpm ops <tarea> [${NO_DRY_RUN_FLAG}]`);
	output.log('');
	output.log('Tareas:');
	formatCatalog(tasks).forEach((line) => output.log(line));
}

export async function dispatch(
	tasks: Readonly<Record<string, OpsTaskDescriptor>>,
	argv: readonly string[],
	output: DispatchOutput,
): Promise<number> {
	const { taskId, apply, unknownArgs } = parseInvocation(argv);

	if (taskId === null) {
		printUsage(tasks, output);
		return 0;
	}

	const descriptor = tasks[taskId];
	if (!descriptor) {
		output.error(`Tarea desconocida: ${taskId}`);
		printUsage(tasks, output);
		return 1;
	}

	if (unknownArgs.length > 0) {
		output.error(`Argumento desconocido: ${unknownArgs[0]}`);
		printUsage(tasks, output);
		return 1;
	}

	try {
		const task = await descriptor.load();
		await task.run({ apply });
		return 0;
	} catch (error) {
		output.error(error);
		return 1;
	}
}
