/**
 * Contexto con el que se llegó a una obra: desde el listado de un autor o desde una colección.
 * Viaja como query params entre las páginas, y decide qué sugerencias de lectura se ofrecen al pie.
 */
export type NavigationContext = 'author' | 'storylist';

export interface NavigationParams {
	readonly navigation: NavigationContext;
	readonly navigationSlug: string;
}
