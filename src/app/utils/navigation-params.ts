/**
 * Contexto con el que se llegó a una obra: desde el listado de un autor o desde una colección.
 * Viaja como query params entre las páginas, y decide qué sugerencias de lectura se ofrecen al pie.
 */
export type NavigationContext = 'author' | 'storylist';

// Alias y no interfaz: los query params viajan como un diccionario de strings, y solo un alias
// obtiene la firma de índice implícita que esa asignación exige.
export type NavigationParams = {
	readonly navigation: NavigationContext;
	readonly navigationSlug: string;
};
