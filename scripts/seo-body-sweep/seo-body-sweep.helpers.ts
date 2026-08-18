/**
 * Núcleo del barrido de cuerpos: todo lo que decide algo, sin red ni relojes.
 *
 * El runner le entrega respuestas ya leídas (`{ status, html }`) y recibe de vuelta el veredicto por
 * página y el de la corrida. Esa frontera es lo que permite fijar en un spec qué se reintenta, qué
 * cuenta como cuerpo vacío y qué código de salida transporta cada desenlace, sin levantar un servidor.
 */
import { collectEmptyBodyViolations } from '../../e2e/_utils/seo-invariants';
import type { SeoInvariantViolation } from '@testing/seo-invariant-violation';

/**
 * El veredicto de una página. `unmeasured` no es un tercer grado de "malo": es la ausencia de dato, y
 * se mantiene separado de `empty` porque un transitorio no puede reportarse como defecto de contenido.
 */
export type PageOutcome =
	| { readonly kind: 'ok' }
	| { readonly kind: 'empty'; readonly violations: readonly SeoInvariantViolation[] }
	| { readonly kind: 'unmeasured'; readonly reason: string };

export interface PageResult {
	readonly path: string;
	readonly outcome: PageOutcome;
}

export interface FetchedPage {
	readonly status: number;
	readonly html: string;
}

/**
 * Umbral propio del barrido, más bajo que el de la suite de invariantes (120).
 *
 * Son dos trabajos distintos: la suite afirma sobre fixtures conocidos, donde 120 caracteres separan
 * bien una página sana de un skeleton; el barrido afirma sobre **todas** las páginas del sitio,
 * incluidas las legítimamente brevísimas. El corpus tiene microcuentos cuyo `<main>` completo —título,
 * tiempo de lectura y cuerpo— ronda los 99 caracteres, y acusarlos de servir un cuerpo vacío sería
 * cambiar un punto ciego por ruido.
 *
 * 40 deja margen de sobra a los dos lados: la falla que motivó el barrido servía un `<main>` de 0
 * caracteres, y el microcuento más corto medido más que duplica el umbral.
 *
 * Lo que el umbral NO puede separar, y conviene tener presente: una página que renderiza su encabezado
 * y pierde solo el cuerpo queda entre los dos extremos y pasa como sana. El barrido detecta el cuerpo
 * **ausente**, que es la forma que toma este defecto cuando el render falla entero; una pérdida
 * parcial necesita un chequeo por tipo de página, que es el trabajo de la muestra del smoke.
 */
export const SWEEP_MIN_CONTENT_LENGTH = 40;

/**
 * Un status fuera de 2xx deja la página sin medir, no vacía: el barrido afirma sobre el cuerpo que se
 * sirve, y una respuesta que no llegó a servir uno no tiene cuerpo sobre el cual afirmar. Que un 404
 * en el sitemap sea su propio defecto es cierto, pero es el defecto de otra herramienta.
 */
export function classifyResponse(page: FetchedPage, minLength: number = SWEEP_MIN_CONTENT_LENGTH): PageOutcome {
	if (!isSuccess(page.status)) {
		return { kind: 'unmeasured', reason: `HTTP ${page.status}` };
	}
	const violations = collectEmptyBodyViolations(page.html, minLength);
	return violations.length === 0 ? { kind: 'ok' } : { kind: 'empty', violations };
}

function isSuccess(status: number): boolean {
	const SUCCESS_RANGE = { from: 200, to: 299 } as const;
	return status >= SUCCESS_RANGE.from && status <= SUCCESS_RANGE.to;
}

/**
 * Se repite lo que pudo salir distinto: 5xx, la espera explícita del 429 y el timeout del 408. Un 4xx
 * determinista se acepta como está — repetirlo llega al mismo lugar más tarde.
 *
 * La clasificación va sobre el número y nunca sobre el texto del error, que cambia con la versión y
 * con el idioma.
 */
export function isTransientStatus(status: number): boolean {
	const TOO_MANY_REQUESTS = 429;
	const REQUEST_TIMEOUT = 408;
	const SERVER_ERROR_RANGE = { from: 500, to: 599 } as const;
	return (
		status === TOO_MANY_REQUESTS ||
		status === REQUEST_TIMEOUT ||
		(status >= SERVER_ERROR_RANGE.from && status <= SERVER_ERROR_RANGE.to)
	);
}

/**
 * Fallas donde la respuesta no llegó, así que el intento no fue determinista. El set es cerrado a
 * propósito: `ENOTFOUND` queda afuera porque un DNS que no resuelve es configuración, y repetirlo solo
 * demora el diagnóstico.
 */
export function isTransientNetworkError(error: unknown): boolean {
	const RETRYABLE_CODES: readonly string[] = [
		'ECONNRESET',
		'ETIMEDOUT',
		'ECONNABORTED',
		'EAI_AGAIN',
		'UND_ERR_CONNECT_TIMEOUT',
		'UND_ERR_HEADERS_TIMEOUT',
		'UND_ERR_BODY_TIMEOUT',
	];
	const code = readErrorCode(error);
	if (code !== undefined && RETRYABLE_CODES.includes(code)) {
		return true;
	}
	// El corte por `AbortSignal.timeout` no trae `code`: llega como un `DOMException` cuyo `name` es
	// `TimeoutError`. Es tan transitorio como un socket cortado, y sin esto no se reintentaría nunca.
	return error instanceof Error && error.name === 'TimeoutError';
}

function readErrorCode(error: unknown): string | undefined {
	if (typeof error !== 'object' || error === null) {
		return undefined;
	}
	const candidates = [(error as { code?: unknown }).code, (error as { cause?: { code?: unknown } }).cause?.code];
	return candidates.find((candidate): candidate is string => typeof candidate === 'string');
}

/** Intentos totales por URL, no reintentos: 3 es el original más dos repeticiones. */
export const MAX_ATTEMPTS = 3;

/** Espera antes del reintento número `retry` (base 1): 1 s antes del primero, 4 s antes del segundo. */
export function backoffFor(retry: number): number {
	const MS_PER_SECOND = 1000;
	const FACTOR = 4;
	return FACTOR ** (retry - 1) * MS_PER_SECOND;
}

export interface RetryDeps {
	sleep: (ms: number) => Promise<void>;
	isTransient: (error: unknown) => boolean;
}

export type RetryResult<T> = { ok: true; value: T; attempts: number } | { ok: false; error: unknown; attempts: number };

/**
 * Devuelve el desenlace en vez de lanzarlo: la cantidad de intentos es dato del reporte, y colgarla de
 * una excepción obligaría a inspeccionarla desde afuera para leerla.
 *
 * `sleep` se inyecta para que el spec ejercite el backoff sin relojes reales.
 */
export async function runWithRetries<T>(operation: () => Promise<T>, deps: RetryDeps): Promise<RetryResult<T>> {
	let attempts = 0;
	for (;;) {
		attempts++;
		try {
			return { ok: true, value: await operation(), attempts };
		} catch (error) {
			if (attempts >= MAX_ATTEMPTS || !deps.isTransient(error)) {
				return { ok: false, error, attempts };
			}
			await deps.sleep(backoffFor(attempts));
		}
	}
}

/**
 * Un status transitorio se convierte en excepción para que `runWithRetries` lo vea: el fetch resuelve
 * con un 503 en vez de rechazar, así que sin esto un 503 se aceptaría al primer intento.
 */
export class TransientResponseError extends Error {
	constructor(public readonly status: number) {
		super(`HTTP ${status}`);
		this.name = 'TransientResponseError';
	}
}

export function isTransientFailure(error: unknown): boolean {
	return error instanceof TransientResponseError || isTransientNetworkError(error);
}

export const EXIT_CODES = Object.freeze({
	clean: 0,
	toolFailure: 1,
	findings: 2,
} as const);

export type ExitCode = (typeof EXIT_CODES)[keyof typeof EXIT_CODES];

/**
 * Solo una página vacía es un hallazgo. Una no medida no lo es: no entra al issue de seguimiento, así
 * que reportarla como hallazgo anunciaría un seguimiento que no se escribió, y un 5xx suelto sobre
 * cientos de URLs dejaría al job avisando casi todas las semanas hasta volverse ruido.
 *
 * No haber medido NADA sí es fallo de la herramienta, tanto si no quedó ningún resultado como si
 * ninguno pudo medirse —el origen entero caído—. Decir "barrido limpio" ahí sería el mismo punto
 * ciego que el barrido viene a cerrar, con otra forma.
 */
export function classifyRunOutcome(results: readonly PageResult[]): ExitCode {
	const measured = results.filter(({ outcome }) => outcome.kind !== 'unmeasured');
	if (measured.length === 0) {
		return EXIT_CODES.toolFailure;
	}
	const hasEmpty = measured.some(({ outcome }) => outcome.kind === 'empty');
	return hasEmpty ? EXIT_CODES.findings : EXIT_CODES.clean;
}

export function emptyPathsOf(results: readonly PageResult[]): string[] {
	return results.filter(({ outcome }) => outcome.kind === 'empty').map(({ path }) => path);
}

export function unmeasuredOf(results: readonly PageResult[]): { path: string; reason: string }[] {
	return results.flatMap(({ path, outcome }) =>
		outcome.kind === 'unmeasured' ? [{ path, reason: outcome.reason }] : [],
	);
}
