/**
 * Deriva, a partir de un recurso del corpus, la variante incompleta que el dataset sí contiene: la
 * que no trae URL. Sirve tanto para el recurso crudo de Sanity como para el del modelo de dominio.
 *
 * El cast es inevitable: el typegen declara `url: string` porque lo deriva del `Rule.required()` del
 * schema, y esa regla valida la edición en el Studio, no lo ya almacenado. La forma existe en los
 * datos y no en los tipos, así que solo se puede construir salteando al compilador — acotado acá,
 * en vez de repetido en cada spec que la necesita.
 */
export function withoutUrl<T extends { url: string }>(resource: T): T {
	const { url, ...rest } = resource;
	return rest as unknown as T;
}
