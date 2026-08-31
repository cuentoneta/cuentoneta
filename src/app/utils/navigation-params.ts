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

/**
 * Normaliza el valor crudo de un query param al contexto de navegación.
 *
 * Acepta `undefined` porque el router lo asigna explícitamente cuando el query param desaparece al
 * navegar: sin ese caso, el binding del input rompe la navegación del lado del cliente.
 *
 * Cualquier otro valor cae al contexto de autor. No es solo una defensa contra un query param
 * inventado: el 301 de las rutas retiradas preserva la query string, así que un enlace compartido
 * puede traer el nombre con el que ese contexto viajaba antes, y el slug que lo acompaña se
 * interpreta entonces como el de un autor.
 */
export function toNavigationContext(value: string | undefined): NavigationContext {
	return value === 'collection' ? 'collection' : 'author';
}
