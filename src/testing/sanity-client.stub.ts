import type { SanityClient } from '@sanity/client';
import { fn } from '@test-utils';

/**
 * Cliente de Sanity que responde según la query que se le pide.
 *
 * Es el seam para ejercitar un **repository real** contra crudo del corpus: lo que se prueba es su ACL,
 * así que sustituir el repository entero por su doble en memoria no serviría — ése guarda dominio ya
 * construido y no traduce nada.
 *
 * Responde por query y no con un valor único porque un repository que consulta más de una en la misma
 * llamada, respondido con un canned, recibiría el crudo de una con la forma de la otra sin que ninguna
 * aserción sobre el resultado lo note.
 *
 * Devuelve también el spy para poder observar con qué query y con qué parámetros se lo llamó.
 */
export function stubSanityClient(
	responses: ReadonlyArray<readonly [query: string, response: unknown]>,
	fallback?: unknown,
) {
	const byQuery = new Map(responses);
	const fetch = fn((query: unknown) =>
		Promise.resolve(byQuery.has(query as string) ? byQuery.get(query as string) : fallback),
	);
	return { client: { fetch } as unknown as SanityClient, fetch };
}
