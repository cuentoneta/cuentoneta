import { fetchMigratedSlug, type LegacyRouteKind } from './legacy-route.repository';

/**
 * Slug al que trasladar una ruta vieja: el vigente del documento migrado desde el origen con ese slug, o
 * el mismo `legacySlug` si nada proviene de él —una ruta vieja que no nombra un origen migrado se traslada
 * tal cual—. Un error de Sanity se propaga: degradar es decisión de quien responde.
 *
 * Un slug más largo que cualquiera que el dataset pueda tener se traslada tal cual sin consultar: la ruta
 * es pública, y sin ese corte cualquier texto que alguien pida le costaría una consulta a Sanity.
 */
export async function resolveLegacySlug(
	kind: LegacyRouteKind,
	legacySlug: string,
	fetchSlug: typeof fetchMigratedSlug = fetchMigratedSlug,
): Promise<string> {
	const maxLegacySlugLength = 200;
	if (legacySlug.length > maxLegacySlugLength) {
		return legacySlug;
	}
	return (await fetchSlug(kind, legacySlug)) ?? legacySlug;
}
