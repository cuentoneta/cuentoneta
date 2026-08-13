/**
 * Política de reintento de las inspecciones contra la URL Inspection API.
 *
 * Vive aparte del núcleo de clasificación porque responde otra pregunta —si una llamada se repite,
 * no qué significa su resultado— y porque no depende del cliente de Google: declara a mano la forma
 * mínima que le pide al error, igual que el núcleo hace con la respuesta. Eso es lo que permite
 * fijar qué se reintenta y qué no sin tocar la red.
 */

/** Lo que se le pide a un error para poder clasificarlo. Es un subconjunto de `GaxiosError`. */
interface ApiFailure {
	status?: unknown;
	code?: unknown;
	response?: { status?: unknown };
}

/**
 * Fallas donde la respuesta NO llegó, así que la llamada no es determinista por construcción. El set
 * es cerrado a propósito: `ENOTFOUND` queda afuera —un DNS que no resuelve es configuración, y
 * repetirlo solo demora el diagnóstico—, el mismo criterio que deja afuera al 403.
 */
const RETRYABLE_NETWORK_CODES: readonly string[] = [
	'ECONNRESET',
	'ETIMEDOUT',
	'ECONNABORTED',
	'EAI_AGAIN',
	'TimeoutError',
];

const TOO_MANY_REQUESTS = 429;
const REQUEST_TIMEOUT = 408;
const SERVER_ERROR_RANGE = { from: 500, to: 599 } as const;

function asFailure(error: unknown): ApiFailure | undefined {
	return typeof error === 'object' && error !== null ? (error as ApiFailure) : undefined;
}

/**
 * El status llega en uno de tres lugares según cómo se haya originado la falla, y `code` solo cuenta
 * cuando es numérico: como string transporta un código de sistema (`ECONNRESET`), que no es un status.
 */
export function readHttpStatus(error: unknown): number | undefined {
	const failure = asFailure(error);
	if (!failure) {
		return undefined;
	}

	for (const candidate of [failure.status, failure.response?.status, failure.code]) {
		if (typeof candidate === 'number') {
			return candidate;
		}
	}
	return undefined;
}

/**
 * La clasificación va sobre el status numérico y nunca sobre el texto del mensaje: `Internal error
 * encountered.` es solo la prosa de un 500, y la prosa cambia con la versión y con el idioma —la
 * misma lección que dejó `coverageState`—.
 *
 * Lo que no se entiende no se repite: un error sin status ni código reconocible puede ser
 * determinista, y reintentarlo gasta cuota para llegar al mismo lugar más tarde.
 */
export function isTransientApiFailure(error: unknown): boolean {
	const status = readHttpStatus(error);
	if (status !== undefined) {
		return status === TOO_MANY_REQUESTS || status === REQUEST_TIMEOUT || isServerError(status);
	}

	const code = asFailure(error)?.code;
	return typeof code === 'string' && RETRYABLE_NETWORK_CODES.includes(code);
}

function isServerError(status: number): boolean {
	return status >= SERVER_ERROR_RANGE.from && status <= SERVER_ERROR_RANGE.to;
}

/**
 * Cupo de reintentos de la corrida. Se reserva de forma **síncrona**, misma invariante que la ranura
 * del pacer: dos workers que consultan a la vez no pueden adjudicarse el mismo cupo.
 */
export interface RetryBudget {
	tryConsume: () => boolean;
	consumed: () => number;
}

export function createRetryBudget(remaining: number): RetryBudget {
	let left = Math.max(0, remaining);
	let used = 0;
	return {
		tryConsume: () => {
			if (left === 0) {
				return false;
			}
			left--;
			used++;
			return true;
		},
		consumed: () => used,
	};
}

export interface RetryDeps {
	/** Reserva la ranura de despacho. Es el pacer global, compartido con el resto de los workers. */
	pace: () => Promise<void>;
	sleep: (ms: number) => Promise<void>;
	budget: RetryBudget;
}

export type RetryResult<T> = { ok: true; value: T; attempts: number } | { ok: false; error: unknown; attempts: number };

const MAX_ATTEMPTS = 3;
const MS_PER_SECOND = 1000;
const BACKOFF_BASE_SECONDS = 1;
const BACKOFF_FACTOR = 4;

/**
 * Espera antes del intento número `attempt` (base 1): 1 s antes del segundo, 4 s antes del tercero.
 *
 * Sin jitter a propósito. El jitter des-sincroniza clientes que reintentan a la vez, y acá cada
 * intento pasa por el pacer, que serializa los despachos: dos reintentos no pueden salir en el mismo
 * instante. Agregarlo obligaría a inyectar una fuente de azar sin resolver nada.
 */
function backoffFor(attempt: number): number {
	return BACKOFF_BASE_SECONDS * BACKOFF_FACTOR ** (attempt - 2) * MS_PER_SECOND;
}

/**
 * Devuelve el resultado en vez de lanzarlo: la cantidad de intentos es dato del reporte, y colgarla
 * de una excepción obligaría a inspeccionarla desde afuera para leerla.
 *
 * `pace()` se llama al tope del bucle, así que un reintento compite por su ranura como cualquier otro
 * despacho. Es lo que mantiene el techo por minuto respetado por construcción, y la razón por la que
 * no se delega en el reintento del propio cliente HTTP: ese ocurre dentro de la llamada, donde el
 * pacer ya no puede intervenir.
 */
export async function runWithRetries<T>(operation: () => Promise<T>, deps: RetryDeps): Promise<RetryResult<T>> {
	let attempts = 0;

	for (;;) {
		await deps.pace();
		attempts++;

		try {
			return { ok: true, value: await operation(), attempts };
		} catch (error) {
			const exhausted = attempts >= MAX_ATTEMPTS;
			if (exhausted || !isTransientApiFailure(error) || !deps.budget.tryConsume()) {
				return { ok: false, error, attempts };
			}
			await deps.sleep(backoffFor(attempts + 1));
		}
	}
}
