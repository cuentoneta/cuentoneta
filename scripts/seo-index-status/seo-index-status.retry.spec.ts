import {
	createRetryBudget,
	isTransientApiFailure,
	readHttpStatus,
	runWithRetries,
	type RetryDeps,
} from './seo-index-status.retry';

/** Doble del entorno del bucle: registra el orden real de ranuras y esperas, sin dejar pasar tiempo. */
function harness(budgetSize = 10): { deps: RetryDeps; paced: () => number; slept: number[]; log: string[] } {
	const slept: number[] = [];
	const log: string[] = [];
	let paced = 0;
	const budget = createRetryBudget(budgetSize);

	return {
		slept,
		log,
		paced: () => paced,
		deps: {
			pace: async () => {
				paced++;
				log.push('pace');
			},
			sleep: async (ms) => {
				slept.push(ms);
				log.push(`sleep:${ms}`);
			},
			budget,
		},
	};
}

const transient = { status: 500, message: 'Internal error encountered.' };
const deterministic = { status: 403, message: 'User does not have sufficient permission.' };

describe('readHttpStatus', () => {
	it('lee el status propio del error', () => {
		expect(readHttpStatus({ status: 503 })).toBe(503);
	});

	it('cae al status de la respuesta cuando el error no lo trae', () => {
		expect(readHttpStatus({ response: { status: 429 } })).toBe(429);
	});

	it('toma `code` solo cuando es numérico', () => {
		expect(readHttpStatus({ code: 500 })).toBe(500);
		expect(readHttpStatus({ code: 'ECONNRESET' })).toBeUndefined();
	});

	it.each([[null], ['boom'], [undefined], [new Error('sin status')]])('devuelve undefined ante %s', (error) => {
		expect(readHttpStatus(error)).toBeUndefined();
	});
});

describe('isTransientApiFailure', () => {
	it.each([500, 503, 429, 408])('reintenta el status %i', (status) => {
		expect(isTransientApiFailure({ status })).toBe(true);
	});

	it.each([400, 401, 403, 404])('NO reintenta el status %i', (status) => {
		expect(isTransientApiFailure({ status })).toBe(false);
	});

	it('reintenta un 500 que llegó como código numérico', () => {
		expect(isTransientApiFailure({ code: 500 })).toBe(true);
	});

	it('reintenta un 500 que solo viene en la respuesta', () => {
		expect(isTransientApiFailure({ response: { status: 500 } })).toBe(true);
	});

	it.each(['ECONNRESET', 'ETIMEDOUT', 'ECONNABORTED', 'EAI_AGAIN', 'TimeoutError'])(
		'reintenta la falla de red %s, donde la respuesta no llegó',
		(code) => {
			expect(isTransientApiFailure({ code })).toBe(true);
		},
	);

	// Un DNS que no resuelve es configuración: repetirlo solo demora el diagnóstico.
	it('NO reintenta ENOTFOUND', () => {
		expect(isTransientApiFailure({ code: 'ENOTFOUND' })).toBe(false);
	});

	it.each([[new Error('pelado')], [null], ['boom'], [{ code: 'ALGO_NUEVO' }]])(
		'NO reintenta lo que no puede clasificar: %s',
		(error) => {
			expect(isTransientApiFailure(error)).toBe(false);
		},
	);
});

describe('createRetryBudget', () => {
	it('reserva de forma síncrona, así dos workers no se adjudican el mismo cupo', () => {
		const budget = createRetryBudget(1);

		expect(budget.tryConsume()).toBe(true);
		expect(budget.tryConsume()).toBe(false);
	});

	it('cuenta lo reservado', () => {
		const budget = createRetryBudget(5);

		budget.tryConsume();
		budget.tryConsume();

		expect(budget.consumed()).toBe(2);
	});

	it('un presupuesto agotado nunca concede', () => {
		expect(createRetryBudget(0).tryConsume()).toBe(false);
	});

	it('trata un presupuesto negativo como agotado', () => {
		expect(createRetryBudget(-10).tryConsume()).toBe(false);
	});
});

describe('runWithRetries', () => {
	it('devuelve el valor del primer intento sin dormir ni gastar presupuesto', async () => {
		const { deps, slept } = harness();

		const result = await runWithRetries(async () => 'ok', deps);

		expect(result).toEqual({ ok: true, value: 'ok', attempts: 1 });
		expect(slept).toEqual([]);
		expect(deps.budget.consumed()).toBe(0);
	});

	it('tras una falla transitoria devuelve el dato real del reintento', async () => {
		const { deps } = harness();
		let calls = 0;

		const result = await runWithRetries(async () => {
			if (calls++ === 0) {
				throw transient;
			}
			return 'dato real';
		}, deps);

		expect(result).toEqual({ ok: true, value: 'dato real', attempts: 2 });
	});

	it('NO reintenta un error determinista', async () => {
		const { deps, slept } = harness();
		let calls = 0;

		const result = await runWithRetries(async () => {
			calls++;
			throw deterministic;
		}, deps);

		expect(calls).toBe(1);
		expect(result).toEqual({ ok: false, error: deterministic, attempts: 1 });
		expect(slept).toEqual([]);
		expect(deps.budget.consumed()).toBe(0);
	});

	it('agota los intentos ante un transitorio persistente y conserva el error original', async () => {
		const { deps } = harness();

		const result = await runWithRetries(async () => {
			throw transient;
		}, deps);

		expect(result.ok).toBe(false);
		expect(result).toMatchObject({ attempts: 3 });
		// La identidad del error se preserva: el reporte muestra el mensaje real de la API.
		expect(result.ok === false && result.error).toBe(transient);
	});

	// La invariante que sostiene el techo por minuto: un reintento no es un despacho gratis.
	it('pide una ranura al pacer por cada intento, reintentos incluidos', async () => {
		const { deps, paced } = harness();

		const result = await runWithRetries(async () => {
			throw transient;
		}, deps);

		expect(paced()).toBe(3);
		expect(result.attempts).toBe(3);
	});

	it('espera el backoff exponencial antes de pedir la ranura siguiente', async () => {
		const { deps, slept, log } = harness();

		await runWithRetries(async () => {
			throw transient;
		}, deps);

		expect(slept).toEqual([1000, 4000]);
		expect(log).toEqual(['pace', 'sleep:1000', 'pace', 'sleep:4000', 'pace']);
	});

	it('no reintenta cuando el presupuesto está agotado, aunque el error sea transitorio', async () => {
		const { deps } = harness(0);
		let calls = 0;

		const result = await runWithRetries(async () => {
			calls++;
			throw transient;
		}, deps);

		expect(calls).toBe(1);
		expect(result).toEqual({ ok: false, error: transient, attempts: 1 });
	});

	it('consume un cupo por reintento efectivo', async () => {
		const { deps } = harness();

		await runWithRetries(async () => {
			throw transient;
		}, deps);

		expect(deps.budget.consumed()).toBe(2);
	});
});
