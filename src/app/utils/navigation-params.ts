/**
 * Contexto con el que se llegó a una obra: desde el listado de un autor o desde una colección.
 * Viaja como query params entre las páginas, y decide qué sugerencias de lectura se ofrecen al pie.
 */
export type NavigationContext = 'author' | 'collection';

// Alias y no interfaz: los query params viajan como un diccionario de strings, y solo un alias
// obtiene la firma de índice implícita que esa asignación exige.
export type NavigationParams = {
	readonly navigation: NavigationContext;
	readonly navigationSlug: string;
};

// El contexto de colección se llamó `storylist` mientras ese era el nombre del dominio, y quedó
// escrito en enlaces ya compartidos hacia afuera. Se sigue aceptando para que esos enlaces no caigan
// en silencio a las sugerencias de autor, que es lo que haría el valor desconocido.
// TODO(#2269): retirar el valor legado junto con el resto de `storylist`.
const LEGACY_COLLECTION_CONTEXT = 'storylist';

/**
 * Normaliza el valor crudo de un query param al contexto de navegación.
 *
 * Acepta `undefined` porque el router lo asigna explícitamente cuando el query param desaparece al
 * navegar: sin ese caso, el binding del input rompe la navegación del lado del cliente.
 */
export function toNavigationContext(value: string | undefined): NavigationContext {
	return value === 'collection' || value === LEGACY_COLLECTION_CONTEXT ? 'collection' : 'author';
}
