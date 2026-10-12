import { zValidator } from '@hono/zod-validator';

import { slugParamSchema } from '@schemas/common.schemas';

/**
 * Valida el `:slug` de una ruta de recurso y responde **404** cuando no tiene formato de slug, con el
 * mismo cuerpo que el 404 del recurso inexistente. Un slug que no puede existir nombra un recurso que
 * no existe, y responder 400 lo volvería un error que la página traduce a 503.
 *
 * @param notFound construye el error de "no encontrado" del módulo; su mensaje es el cuerpo del 404.
 */
export function slugParamValidator(notFound: (slug: string) => Error) {
	return zValidator('param', slugParamSchema, (result, c) => {
		if (!result.success) {
			return c.json({ error: notFound(String(result.data.slug)).message }, 404);
		}
	});
}
