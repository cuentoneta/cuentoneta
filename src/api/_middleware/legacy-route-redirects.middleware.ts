import type { Handler } from 'hono';
import type { BlankEnv } from 'hono/types';
import { applyReadCacheHeaders } from '../_helpers/cache-control';
import { resolveLegacySlug } from '../modules/legacy-route/legacy-route.service';

/**
 * Las URLs indexadas de la plataforma se mudaron: obra y colección tienen rutas nuevas para su listado
 * y su detalle. La mudanza tiene que viajar en la respuesta HTTP y no en el router del cliente: un crawler que no ejecuta JavaScript
 * solo ve el 301, y es el 301 —no un alias— lo que traslada lo que la ruta vieja tenga indexado.
 *
 * Son handlers terminales y no middlewares: responden en vez de ceder a `next()`, a diferencia del
 * resto de esta carpeta.
 *
 * Los destinos van como literales porque `src/api/**` no importa `AppRoutes`, que es del frontend.
 */

/**
 * Arma el handler de detalle de una sección: traslada al slug que `resolveSlug` devuelve para el slug
 * pedido, preservando la query string.
 *
 * Resolver consulta Sanity, así que el traslado resuelto se cachea en el borde y el rastreo de las rutas
 * viejas no llega al origen en cada visita. Si la consulta falla, traslada al slug pedido tal cual y
 * prohíbe cachearlo —un 301 es cacheable por defecto, incluso sin headers—: acierta para casi todo
 * documento migrado, y el pedido siguiente vuelve a intentar resolver en vez de heredar un destino que
 * puede estar mal.
 *
 * El slug se codifica antes de componer el destino, venga del router —que lo entrega decodificado— o de
 * Sanity —que lo guarda crudo—: uno que contenga un carácter reservado produciría un `Location` con una
 * ruta distinta de la buscada y, en el peor caso, con otro host.
 *
 * La query string viaja porque es donde vienen los parámetros de campaña: perderlos en el traslado
 * rompe la atribución de cada enlace ya publicado hacia afuera.
 */
export function legacyDetailRedirect(
	sectionPath: string,
	resolveSlug: (legacySlug: string) => Promise<string>,
): Handler<BlankEnv, '/:slug'> {
	return async (c) => {
		const { search } = new URL(c.req.url);
		const legacySlug = c.req.param('slug');
		let slug = legacySlug;
		try {
			slug = await resolveSlug(legacySlug);
			applyReadCacheHeaders(c);
		} catch (error) {
			c.header('Cache-Control', 'no-store');
			console.error('[LegacyRoute] no se pudo resolver el destino; se traslada el slug tal cual', {
				sectionPath,
				legacySlug,
				error,
			});
		}
		return c.redirect(`${sectionPath}/${encodeURIComponent(slug)}${search}`, 301);
	};
}

export const legacyStoryListingRedirect: Handler = (c) => c.redirect('/literary-work', 301);
export const legacyStorylistListingRedirect: Handler = (c) => c.redirect('/collection', 301);
export const legacyStoryDetailRedirect = legacyDetailRedirect('/literary-work', (slug) =>
	resolveLegacySlug('story', slug),
);
export const legacyStorylistDetailRedirect = legacyDetailRedirect('/collection', (slug) =>
	resolveLegacySlug('storylist', slug),
);
