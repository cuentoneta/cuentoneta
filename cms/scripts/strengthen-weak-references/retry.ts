type Duration = `${number}ms` | `${number}s`;

/** Las dos dependencias de tiempo del reintento, inyectables para que los tests no esperen de verdad. */
export interface Clock {
	sleep(milliseconds: number): Promise<void>;
	/** Época en milisegundos, para resolver un `Retry-After` expresado como fecha HTTP. */
	now(): number;
}

/** Resultado de una operación reintentada: nunca lanza, y `attempts` cuenta también el que tuvo éxito. */
export type Attempt<T> =
	| { readonly ok: true; readonly value: T; readonly attempts: number }
	| { readonly ok: false; readonly error: unknown; readonly attempts: number };

const MAX_ATTEMPTS = 6;
const BACKOFF_BASE: Duration = '1s';
// Techo del backoff calculado, no del `Retry-After`: lo que pide el servidor se respeta aunque lo supere.
const BACKOFF_CEILING: Duration = '30s';

/** Resuelve una duración en milisegundos o segundos (`'200ms'`, `'1s'`); lanza ante otra forma. */
export function toMilliseconds(duration: Duration): number {
	const match = /^(\d+)(ms|s)$/.exec(duration);
	if (!match) {
		throw new Error(`Duración inválida: "${duration}"`);
	}
	const amount = Number(match[1]);
	return match[2] === 's' ? amount * 1000 : amount;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

/** El status HTTP de un error de `@sanity/client`, o `undefined` si la falla no llegó a tener respuesta. */
export function readStatusCode(error: unknown): number | undefined {
	return isRecord(error) && typeof error['statusCode'] === 'number' ? error['statusCode'] : undefined;
}

function readHeader(error: unknown, name: string): string | undefined {
	const response = isRecord(error) ? error['response'] : undefined;
	const headers = isRecord(response) ? response['headers'] : undefined;
	if (!isRecord(headers)) {
		return undefined;
	}
	const key = Object.keys(headers).find((candidate) => candidate.toLowerCase() === name);
	const value = key === undefined ? undefined : headers[key];
	return typeof value === 'string' ? value : undefined;
}

/**
 * Cuántos milisegundos pide esperar el servidor. El header viaja en `error.response.headers` y no en
 * `error.retryAfter`, que es donde lo busca `@sanity/import`. Acepta segundos o fecha HTTP; un valor
 * ilegible se trata como ausente.
 */
export function readRetryAfter(error: unknown, now: number): number | undefined {
	const header = readHeader(error, 'retry-after')?.trim();
	if (!header) {
		return undefined;
	}
	if (/^\d+$/.test(header)) {
		return toMilliseconds(`${Number(header)}s`);
	}
	const date = Date.parse(header);
	return Number.isNaN(date) ? undefined : Math.max(0, date - now);
}

/** Reintenta el límite de tasa, los errores del servidor y las fallas de red; nunca otro 4xx, como un 409. */
export function isRetriable(error: unknown): boolean {
	const status = readStatusCode(error);
	return status === undefined || status === 429 || status >= 500;
}

/** Espera exponencial para el intento `attempt` (desde 1), acotada por un techo. */
export function backoffFor(attempt: number): number {
	return Math.min(toMilliseconds(BACKOFF_BASE) * 2 ** (attempt - 1), toMilliseconds(BACKOFF_CEILING));
}

/** Corre `operation` hasta que tenga éxito, falle con un error no reintentable o agote los intentos. */
export async function runWithBackoff<T>(operation: () => Promise<T>, clock: Clock): Promise<Attempt<T>> {
	for (let attempt = 1; ; attempt++) {
		try {
			return { ok: true, value: await operation(), attempts: attempt };
		} catch (error) {
			if (!isRetriable(error) || attempt === MAX_ATTEMPTS) {
				return { ok: false, error, attempts: attempt };
			}
			await clock.sleep(Math.max(readRetryAfter(error, clock.now()) ?? 0, backoffFor(attempt)));
		}
	}
}
