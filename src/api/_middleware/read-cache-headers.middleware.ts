import { createMiddleware } from 'hono/factory';
import { applyReadCacheHeaders } from '../_helpers/cache-control';

/**
 * Emite los headers de caché de borde para las respuestas 200 de las rutas de lectura de una obra
 * servidas como JSON. A diferencia de `ssrCacheControl`, no inspecciona el body: la respuesta la
 * produce el propio controller y es determinística, sin el fallback CSR que obliga a la guarda.
 */
export const readCacheHeaders = createMiddleware(async (c, next) => {
	await next();

	if (c.res.status !== 200) {
		return;
	}

	applyReadCacheHeaders(c);
});
