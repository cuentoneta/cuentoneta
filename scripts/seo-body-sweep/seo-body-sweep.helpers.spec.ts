import {
	backoffFor,
	classifyResponse,
	classifyRunOutcome,
	emptyPathsOf,
	EXIT_CODES,
	isTransientFailure,
	isTransientNetworkError,
	isTransientStatus,
	runWithRetries,
	TransientResponseError,
	unmeasuredOf,
	type PageResult,
} from './seo-body-sweep.helpers';

const bodyText = 'texto '.repeat(40);
const FULL_PAGE = `<main><h1>Título</h1><p>${bodyText}</p></main>`;
const EMPTY_PAGE = `<html><body><cuentoneta-root ng-server-context="ssr"><main></main></cuentoneta-root></body></html>`;

describe('classifyResponse', () => {
	it('acepta un 200 con cuerpo', () => {
		expect(classifyResponse({ status: 200, html: FULL_PAGE })).toEqual({ kind: 'ok' });
	});

	it('reporta vacío un 200 sin cuerpo', () => {
		const outcome = classifyResponse({ status: 200, html: EMPTY_PAGE });
		expect(outcome.kind).toBe('empty');
		expect(outcome.kind === 'empty' && outcome.violations.map((violation) => violation.rule)).toEqual([
			'primary-content',
		]);
	});

	it('deja sin medir un status fuera de 2xx, con su causa', () => {
		expect(classifyResponse({ status: 500, html: '' })).toEqual({ kind: 'unmeasured', reason: 'HTTP 500' });
		expect(classifyResponse({ status: 404, html: FULL_PAGE })).toEqual({ kind: 'unmeasured', reason: 'HTTP 404' });
	});

	it('no reporta vacío un 404 aunque su cuerpo lo esté: no midió, no acusa', () => {
		expect(classifyResponse({ status: 404, html: '<main></main>' }).kind).toBe('unmeasured');
	});

	it('respeta un umbral explícito', () => {
		expect(classifyResponse({ status: 200, html: '<main><p>breve</p></main>' }, 3)).toEqual({ kind: 'ok' });
	});
});

describe('isTransientStatus', () => {
	it.each([500, 502, 503, 504, 429, 408])('reintenta %i', (status) => {
		expect(isTransientStatus(status)).toBe(true);
	});

	it.each([200, 301, 400, 403, 404, 410])('no reintenta %i', (status) => {
		expect(isTransientStatus(status)).toBe(false);
	});
});

describe('isTransientNetworkError', () => {
	it('reintenta una conexión cortada', () => {
		expect(isTransientNetworkError(Object.assign(new Error('boom'), { code: 'ECONNRESET' }))).toBe(true);
	});

	it('lee el código anidado en cause, que es donde lo pone fetch', () => {
		expect(isTransientNetworkError(Object.assign(new Error('fetch failed'), { cause: { code: 'ETIMEDOUT' } }))).toBe(
			true,
		);
	});

	it('no reintenta un DNS que no resuelve: es configuración, no un transitorio', () => {
		expect(isTransientNetworkError(Object.assign(new Error('boom'), { code: 'ENOTFOUND' }))).toBe(false);
	});

	it('no reintenta lo que no reconoce', () => {
		expect(isTransientNetworkError(new Error('vaya a saber'))).toBe(false);
		expect(isTransientNetworkError('un string suelto')).toBe(false);
	});
});

describe('backoffFor', () => {
	it('espera 1 s antes del primer reintento y 4 s antes del segundo', () => {
		expect(backoffFor(1)).toBe(1000);
		expect(backoffFor(2)).toBe(4000);
	});
});

describe('runWithRetries', () => {
	function recordingSleep() {
		const waits: number[] = [];
		return { waits, sleep: async (ms: number) => void waits.push(ms) };
	}

	it('devuelve el valor sin reintentar cuando la operación anda', async () => {
		const { waits, sleep } = recordingSleep();
		const result = await runWithRetries(async () => 'ok', { sleep, isTransient: isTransientFailure });
		expect(result).toEqual({ ok: true, value: 'ok', attempts: 1 });
		expect(waits).toEqual([]);
	});

	it('agota los tres intentos ante un 503 sostenido, esperando 1 s y 4 s', async () => {
		const { waits, sleep } = recordingSleep();
		let calls = 0;
		const result = await runWithRetries(
			async () => {
				calls++;
				throw new TransientResponseError(503);
			},
			{ sleep, isTransient: isTransientFailure },
		);
		expect(calls).toBe(3);
		expect(waits).toEqual([1000, 4000]);
		expect(result.ok).toBe(false);
		expect(result.attempts).toBe(3);
	});

	it('se queda con el primer resultado bueno tras un transitorio', async () => {
		const { waits, sleep } = recordingSleep();
		let calls = 0;
		const result = await runWithRetries(
			async () => {
				calls++;
				if (calls === 1) {
					throw new TransientResponseError(500);
				}
				return 'ok';
			},
			{ sleep, isTransient: isTransientFailure },
		);
		expect(result).toEqual({ ok: true, value: 'ok', attempts: 2 });
		expect(waits).toEqual([1000]);
	});

	it('no reintenta lo determinista', async () => {
		const { waits, sleep } = recordingSleep();
		let calls = 0;
		const result = await runWithRetries(
			async () => {
				calls++;
				throw new Error('determinista');
			},
			{ sleep, isTransient: isTransientFailure },
		);
		expect(calls).toBe(1);
		expect(waits).toEqual([]);
		expect(result.ok).toBe(false);
	});
});

describe('classifyRunOutcome', () => {
	const ok: PageResult = { path: '/a', outcome: { kind: 'ok' } };
	const empty: PageResult = { path: '/b', outcome: { kind: 'empty', violations: [] } };
	const unmeasured: PageResult = { path: '/c', outcome: { kind: 'unmeasured', reason: 'HTTP 503' } };

	it('sale limpio cuando todas las páginas sirven cuerpo', () => {
		expect(classifyRunOutcome([ok, ok])).toBe(EXIT_CODES.clean);
	});

	it('reporta hallazgos ante un cuerpo vacío', () => {
		expect(classifyRunOutcome([ok, empty])).toBe(EXIT_CODES.findings);
	});

	it('reporta hallazgos ante una página que no se pudo medir', () => {
		expect(classifyRunOutcome([ok, unmeasured])).toBe(EXIT_CODES.findings);
	});

	// Cero resultados con el sitemap en la mano es la herramienta rota, no un sitio sano: darlo verde
	// reproduciría el punto ciego que el barrido existe para cerrar.
	it('falla como herramienta cuando no obtuvo ningún resultado', () => {
		expect(classifyRunOutcome([])).toBe(EXIT_CODES.toolFailure);
	});
});

describe('particiones del reporte', () => {
	const results: PageResult[] = [
		{ path: '/ok', outcome: { kind: 'ok' } },
		{ path: '/author/vacio', outcome: { kind: 'empty', violations: [] } },
		{ path: '/story/caido', outcome: { kind: 'unmeasured', reason: 'HTTP 503' } },
	];

	it('separa los vacíos de los no medidos', () => {
		expect(emptyPathsOf(results)).toEqual(['/author/vacio']);
		expect(unmeasuredOf(results)).toEqual([{ path: '/story/caido', reason: 'HTTP 503' }]);
	});
});
