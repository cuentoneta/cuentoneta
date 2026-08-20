/**
 * Fixtures del catálogo de colecciones para los e2e de la página de colección.
 *
 * La identidad de la colección que se lee sale de `STABLE_SLUGS`, pero el largo de su descripción no:
 * un slug no dice nada sobre cuánto texto le cargó la curaduría, y ese texto es justamente lo que decide
 * si el recorte desborda. Se resuelve entonces contra el catálogo real, en runtime.
 */
import type { APIRequestContext } from '@playwright/test';

import { VIEWPORT_WIDTHS_NUMERIC } from '@utils/screen.utils';

// La columna lateral y el panel deslizable viven tras `hidden lg:flex`, así que hace falta superar el
// breakpoint `lg`. Se toma el ancho de `xl` y no el borde exacto porque `setViewportSize` fija el tamaño
// de la ventana con la barra de scroll incluida: al ras del breakpoint, el ancho útil queda por debajo.
export const DESKTOP_VIEWPORT = Object.freeze({ width: VIEWPORT_WIDTHS_NUMERIC.xl, height: 900 });

const CATALOG_ROUTE = '/api/collection';

/** Lo único que los specs consumen del teaser que entrega el catálogo. */
export interface CollectionCatalogEntry {
	slug: string;
	title: string;
	description: string;
}

export async function fetchCollectionCatalog(request: APIRequestContext): Promise<CollectionCatalogEntry[]> {
	const response = await request.get(CATALOG_ROUTE);
	// Un catálogo caído y un catálogo vacío llevan a fixtures distintos, y sin esto los dos llegarían
	// como una lista sin entradas.
	if (response.status() !== 200) {
		throw new Error(`"${CATALOG_ROUTE}" respondió ${response.status()}: el catálogo de colecciones no está`);
	}
	return response.json();
}

/** Texto plano de una descripción saneada, para compararla contra lo que se lee en pantalla. */
export function descriptionText(html: string): string {
	return html
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * La colección de descripción más larga del catálogo, que es la candidata a desbordar el recorte.
 *
 * El desempate por slug mantiene la elección estable entre corridas: sin él, dos descripciones del mismo
 * largo harían que el spec leyera una página distinta según el orden en que el CMS devolvió el catálogo.
 */
export function pickMostDescriptiveCollection(
	catalog: readonly CollectionCatalogEntry[],
): CollectionCatalogEntry | undefined {
	return catalog.reduce<CollectionCatalogEntry | undefined>((mostDescriptive, candidate) => {
		if (!mostDescriptive) {
			return candidate;
		}
		const candidateLength = descriptionText(candidate.description).length;
		const currentLength = descriptionText(mostDescriptive.description).length;
		if (candidateLength > currentLength) {
			return candidate;
		}
		return candidateLength === currentLength && candidate.slug < mostDescriptive.slug ? candidate : mostDescriptive;
	}, undefined);
}
