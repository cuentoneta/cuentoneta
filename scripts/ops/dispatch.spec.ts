import { fn } from '@test-utils';
import { dispatch, formatCatalog, parseInvocation } from './dispatch';
import { OPS_TASKS, type OpsTaskArgs, type OpsTaskDescriptor } from './registry';

type TaskRun = (args: OpsTaskArgs) => Promise<void>;

function stubTask(description = 'Descripción de prueba') {
	const run = fn<TaskRun>(async () => {});
	const load = fn(() => Promise.resolve({ run }));
	const descriptor: OpsTaskDescriptor = { description, load };
	return { run, load, descriptor };
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

describe('parseInvocation', () => {
	it('extrae el id de la tarea y detecta el flag --no-dry-run', () => {
		expect(parseInvocation(['reading-time:backfill', '--no-dry-run'])).toEqual({
			taskId: 'reading-time:backfill',
			apply: true,
		});
	});

	it('detecta el flag esté donde esté en el argv', () => {
		expect(parseInvocation(['--no-dry-run', 'assets:delete-unused']).apply).toBe(true);
	});

	it('reporta el modo seco cuando el flag no está', () => {
		expect(parseInvocation(['drafts:remove-unpublished']).apply).toBe(false);
	});

	it('queda sin tarea cuando solo se pasan flags', () => {
		expect(parseInvocation(['--no-dry-run']).taskId).toBeNull();
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
		const { run, load, descriptor } = stubTask();
		const { output } = stubOutput();

		const exitCode = await dispatch({ 'tarea:prueba': descriptor }, ['tarea:prueba', '--no-dry-run'], output);

		expect(exitCode).toBe(0);
		expect(load).toHaveBeenCalledTimes(1);
		expect(run).toHaveBeenCalledWith({ apply: true });
	});

	it('pasa apply en false por defecto: la corrida en seco es el default', async () => {
		const { run, descriptor } = stubTask();
		const { output } = stubOutput();

		await dispatch({ 'tarea:prueba': descriptor }, ['tarea:prueba'], output);

		expect(run).toHaveBeenCalledWith({ apply: false });
	});

	it('imprime el catálogo y termina bien cuando no hay tarea, sin cargar ninguna', async () => {
		const { load, descriptor } = stubTask();
		const { logged, errors, output } = stubOutput();

		const exitCode = await dispatch({ 'tarea:prueba': descriptor }, [], output);

		expect(exitCode).toBe(0);
		expect(load).not.toHaveBeenCalled();
		expect(errors).toEqual([]);
		expect(logged.join('\n')).toContain('tarea:prueba');
	});

	it('rechaza un id desconocido con el catálogo y sin cargar ninguna tarea', async () => {
		const { load, descriptor } = stubTask();
		const { logged, errors, output } = stubOutput();

		const exitCode = await dispatch({ 'tarea:prueba': descriptor }, ['otra:tarea'], output);

		expect(exitCode).toBe(1);
		expect(load).not.toHaveBeenCalled();
		expect(errors.join('\n')).toContain('otra:tarea');
		expect(logged.join('\n')).toContain('tarea:prueba');
	});

	it('reporta el error de una tarea fallida y termina con código distinto de cero', async () => {
		const fallida: OpsTaskDescriptor = {
			description: 'Descripción de prueba',
			load: () =>
				Promise.resolve({
					run: async () => {
						throw new Error('falló la escritura');
					},
				}),
		};
		const { errors, output } = stubOutput();

		const exitCode = await dispatch({ 'tarea:prueba': fallida }, ['tarea:prueba'], output);

		expect(exitCode).toBe(1);
		expect(errors[0]).toEqual(new Error('falló la escritura'));
	});
});
