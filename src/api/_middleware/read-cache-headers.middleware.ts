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

	// Un handler que ya se declaró incacheable gana sobre el default de la ruta. La alternativa era una
	// lista de rutas exceptuadas acá, que obliga a recordar actualizarla cada vez que el módulo suma una
	// escritura; y una escritura servida desde la caché de borde devuelve un 200 sin haber corrido.
	if (c.res.headers.get('Cache-Control')?.includes('no-store')) {
		return;
	}

	applyReadCacheHeaders(c);
});
