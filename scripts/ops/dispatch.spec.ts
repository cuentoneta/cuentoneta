import { fn } from '@test-utils';
import { dispatch, formatCatalog, resolveInvocation } from './dispatch';
import {
	EXIT_CODES,
	OPS_TASKS,
	type ExitCode,
	type OpsCatalog,
	type OpsTaskArgs,
	type OpsTaskDescriptor,
} from './registry';

type TaskRun = (args: OpsTaskArgs) => Promise<ExitCode | void>;

function stubTask(description = 'Descripción de prueba', destructive = false, acceptsArgs = false) {
	const run = fn<TaskRun>(() => Promise.resolve());
	const load = fn(() => Promise.resolve({ run }));
	const descriptor: OpsTaskDescriptor = { description, destructive, acceptsArgs, load };
	return { run, load, descriptor };
}

function stubCatalog(): {
	readonly tasks: OpsCatalog;
	readonly run: ReturnType<typeof fn<TaskRun>>;
	readonly load: ReturnType<typeof fn>;
} {
	const { run, load, descriptor } = stubTask();
	return { tasks: { 'tarea:prueba': descriptor }, run, load };
}

function stubOutput() {
	const logged: string[] = [];
	const errors: unknown[] = [];
	return {
		logged,
		errors,
		output: {
			log: (message: string) => {
				logged.push(message);
			},
			error: (message: unknown) => {
				errors.push(message);
			},
		},
	};
}

describe('resolveInvocation', () => {
	it('pide el catálogo cuando no hay ninguna tarea', () => {
		expect(resolveInvocation({}, [])).toEqual({ action: 'usage' });
	});

	it('ejecuta la tarea registrada en modo seco por defecto', () => {
		const { descriptor } = stubTask();

		expect(resolveInvocation({ 'tarea:prueba': descriptor }, ['tarea:prueba'])).toEqual({
			action: 'execute',
			descriptor,
			args: { apply: false, argv: [] },
		});
	});

	it('deriva aplicar del flag --no-dry-run esté donde esté en el argv', () => {
		const { descriptor } = stubTask();
		const tasks: OpsCatalog = { 'tarea:prueba': descriptor };

		expect(resolveInvocation(tasks, ['tarea:prueba', '--no-dry-run'])).toEqual({
			action: 'execute',
			descriptor,
			args: { apply: true, argv: [] },
		});
		expect(resolveInvocation(tasks, ['--no-dry-run', 'tarea:prueba'])).toEqual({
			action: 'execute',
			descriptor,
			args: { apply: true, argv: [] },
		});
	});

	it('rechaza un id que no corresponde a ninguna tarea', () => {
		expect(resolveInvocation(stubCatalog().tasks, ['otra:tarea'])).toEqual({
			action: 'reject',
			reason: 'Tarea desconocida: otra:tarea',
		});
	});

	it('rechaza un id que coincide con una propiedad heredada del objeto en vez de una tarea', () => {
		for (const idHeredado of ['toString', 'constructor', 'hasOwnProperty']) {
			expect(resolveInvocation(stubCatalog().tasks, [idHeredado])).toEqual({
				action: 'reject',
				reason: `Tarea desconocida: ${idHeredado}`,
			});
		}
	});

	it('rechaza los argumentos adicionales tras un id válido', () => {
		expect(resolveInvocation(stubCatalog().tasks, ['tarea:prueba', 'extra'])).toEqual({
			action: 'reject',
			reason: 'Argumento desconocido: extra',
		});
	});

	it('le pasa los argumentos propios a una tarea que los declara', () => {
		const { descriptor } = stubTask('Descripción de prueba', false, true);

		expect(resolveInvocation({ 'tarea:prueba': descriptor }, ['tarea:prueba', '--limit=10', 'ruta'])).toEqual({
			action: 'execute',
			descriptor,
			args: { apply: false, argv: ['--limit=10', 'ruta'] },
		});
	});

	it('no confunde el flag global con un argumento propio de la tarea', () => {
		const { descriptor } = stubTask('Descripción de prueba', false, true);

		expect(resolveInvocation({ 'tarea:prueba': descriptor }, ['tarea:prueba', '--no-dry-run', '--limit=10'])).toEqual({
			action: 'execute',
			descriptor,
			args: { apply: true, argv: ['--limit=10'] },
		});
	});

	it('trata un flag mal tipeado como argumento desconocido', () => {
		expect(resolveInvocation(stubCatalog().tasks, ['tarea:prueba', '--dry-run'])).toEqual({
			action: 'reject',
			reason: 'Argumento desconocido: --dry-run',
		});
	});

	it('reporta primero la tarea desconocida cuando también sobra un argumento', () => {
		expect(resolveInvocation(stubCatalog().tasks, ['otra:tarea', 'extra'])).toEqual({
			action: 'reject',
			reason: 'Tarea desconocida: otra:tarea',
		});
	});

	it('rechaza una tarea destructiva sin el flag de confirmación', () => {
		const { descriptor } = stubTask('Descripción de prueba', true);

		expect(resolveInvocation({ 'tarea:prueba': descriptor }, ['tarea:prueba'])).toEqual({
			action: 'reject',
			reason: 'La tarea tarea:prueba es destructiva y requiere --no-dry-run para correr',
		});
	});

	it('ejecuta una tarea destructiva con el flag de confirmación', () => {
		const { descriptor } = stubTask('Descripción de prueba', true);

		expect(resolveInvocation({ 'tarea:prueba': descriptor }, ['tarea:prueba', '--no-dry-run'])).toEqual({
			action: 'execute',
			descriptor,
			args: { apply: true, argv: [] },
		});
	});
});

describe('formatCatalog', () => {
	it('lista cada tarea con su descripción, alineada por id', () => {
		const lines = formatCatalog({
			b: stubTask('Tarea B').descriptor,
			'muy-larga:id': stubTask('Tarea A').descriptor,
		});

		expect(lines).toEqual(['  b             Tarea B', '  muy-larga:id  Tarea A']);
	});

	it('declara una descripción para cada tarea del registro real', () => {
		for (const [id, descriptor] of Object.entries(OPS_TASKS)) {
			expect(descriptor.description.length).toBeGreaterThan(0);
			expect(formatCatalog(OPS_TASKS).join('\n')).toContain(id);
		}
	});
});

describe('dispatch', () => {
	it('carga la tarea registrada y le pasa apply en true ante el flag', async () => {
		const { tasks, run, load } = stubCatalog();
		const { output } = stubOutput();

		await expect(dispatch(tasks, ['tarea:prueba', '--no-dry-run'], output)).resolves.toBe(0);

		expect(load).toHaveBeenCalledTimes(1);
		expect(run).toHaveBeenCalledWith({ apply: true, argv: [] });
	});

	it('pasa apply en false por defecto: la corrida en seco es el default', async () => {
		const { tasks, run } = stubCatalog();
		const { output } = stubOutput();

		await expect(dispatch(tasks, ['tarea:prueba'], output)).resolves.toBe(0);

		expect(run).toHaveBeenCalledWith({ apply: false, argv: [] });
	});

	it('acepta el flag antes del id', async () => {
		const { tasks, run } = stubCatalog();
		const { output } = stubOutput();

		await expect(dispatch(tasks, ['--no-dry-run', 'tarea:prueba'], output)).resolves.toBe(0);

		expect(run).toHaveBeenCalledWith({ apply: true, argv: [] });
	});

	it('le pasa a la tarea sus argumentos propios, sin el flag global', async () => {
		const { descriptor, run } = stubTask('Descripción de prueba', false, true);
		const { output } = stubOutput();

		await expect(
			dispatch({ 'tarea:prueba': descriptor }, ['tarea:prueba', '--limit=10', 'ruta'], output),
		).resolves.toBe(0);

		expect(run).toHaveBeenCalledWith({ apply: false, argv: ['--limit=10', 'ruta'] });
	});

	it('devuelve el código que reporta la tarea', async () => {
		const fallida: OpsTaskDescriptor = {
			description: 'Descripción de prueba',
			destructive: false,
			acceptsArgs: false,
			load: () => Promise.resolve({ run: async () => EXIT_CODES.partial }),
		};
		const { output } = stubOutput();

		await expect(dispatch({ 'tarea:prueba': fallida }, ['tarea:prueba'], output)).resolves.toBe(EXIT_CODES.partial);
	});

	it('imprime el catálogo y termina bien cuando no hay tarea, sin cargar ninguna', async () => {
		const { tasks, load } = stubCatalog();
		const { logged, errors, output } = stubOutput();

		await expect(dispatch(tasks, [], output)).resolves.toBe(0);

		expect(load).not.toHaveBeenCalled();
		expect(errors).toEqual([]);
		expect(logged.join('\n')).toContain('tarea:prueba');
	});

	it('rechaza un id desconocido con el catálogo y sin cargar ninguna tarea', async () => {
		const { tasks, load } = stubCatalog();
		const { logged, errors, output } = stubOutput();

		await expect(dispatch(tasks, ['otra:tarea'], output)).resolves.toBe(1);

		expect(load).not.toHaveBeenCalled();
		expect(errors.join('\n')).toContain('otra:tarea');
		expect(logged.join('\n')).toContain('tarea:prueba');
	});

	it('rechaza argumentos adicionales sin cargar ni ejecutar la tarea', async () => {
		const { tasks, run, load } = stubCatalog();
		const { logged, errors, output } = stubOutput();

		await expect(dispatch(tasks, ['tarea:prueba', 'extra'], output)).resolves.toBe(1);

		expect(load).not.toHaveBeenCalled();
		expect(run).not.toHaveBeenCalled();
		expect(errors.join('\n')).toContain('Argumento desconocido: extra');
		expect(logged.join('\n')).toContain('tarea:prueba');
	});

	it('rechaza una tarea destructiva sin cargarla ni ejecutarla cuando falta la confirmación', async () => {
		const { run, load, descriptor } = stubTask('Descripción de prueba', true);
		const { logged, errors, output } = stubOutput();

		await expect(dispatch({ 'tarea:prueba': descriptor }, ['tarea:prueba'], output)).resolves.toBe(1);

		expect(load).not.toHaveBeenCalled();
		expect(run).not.toHaveBeenCalled();
		expect(errors.join('\n')).toContain('destructiva');
		expect(logged.join('\n')).toContain('tarea:prueba');
	});

	it('reporta el error de una tarea fallida y termina con código distinto de cero', async () => {
		const fallida: OpsTaskDescriptor = {
			description: 'Descripción de prueba',
			destructive: false,
			acceptsArgs: false,
			load: () =>
				Promise.resolve({
					run: async () => {
						throw new Error('falló la escritura');
					},
				}),
		};
		const { errors, output } = stubOutput();

		await expect(dispatch({ 'tarea:prueba': fallida }, ['tarea:prueba'], output)).resolves.toBe(1);

		expect(errors[0]).toEqual(new Error('falló la escritura'));
	});
});
