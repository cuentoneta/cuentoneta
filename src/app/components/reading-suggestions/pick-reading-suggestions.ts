// Cantidad de sugerencias del bloque. La comparten quien las elige y el estado de carga, que reserva
// el alto de esa misma cantidad de tarjetas.
export const READING_SUGGESTIONS_COUNT = 3;

/**
 * Elige al azar las obras que se sugieren al pie de la lectura, descartando la que se está leyendo.
 *
 * El azar se resuelve donde se invoca —una vez por fetch, en el stream del recurso— para que las
 * sugerencias no se rebarajen mientras la persona lee.
 *
 * TODO(#2081): la selección es transitoria y la resuelve el backend. Elegir en el cliente obliga a
 * transferir la colección entera para mostrar tres, y deja el criterio en la capa de presentación.
 */
export function pickReadingSuggestions<T extends { readonly slug: string }>(
	candidates: readonly T[],
	currentWorkSlug?: string,
	count: number = READING_SUGGESTIONS_COUNT,
	random: () => number = Math.random,
): T[] {
	const pool = candidates.filter((candidate) => candidate.slug !== currentWorkSlug);

	// Fisher-Yates parcial: alcanza con barajar las primeras `count` posiciones.
	for (let index = 0; index < Math.min(count, pool.length); index++) {
		const pick = index + Math.floor(random() * (pool.length - index));
		[pool[index], pool[pick]] = [pool[pick], pool[index]];
	}

	return pool.slice(0, count);
}
