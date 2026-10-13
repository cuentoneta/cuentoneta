import type { Context, Handler } from 'hono';
import type { BlankEnv } from 'hono/types';

/**
 * Las URLs indexadas de la plataforma se mudaron: la portada se sirve en la raíz, y obra y colección
 * tienen rutas nuevas para su listado y su detalle. La mudanza tiene que viajar en la respuesta HTTP y no en el router del cliente: un crawler que no ejecuta JavaScript
 * solo ve el 301, y es el 301 —no un alias— lo que traslada lo que la ruta vieja tenga indexado.
 *
 * Son handlers terminales y no middlewares: responden en vez de ceder a `next()`, a diferencia del
 * resto de esta carpeta.
 *
 * Los destinos van como literales porque `src/api/**` no importa `AppRoutes`, que es del frontend.
 */

/**
 * Redirige con 301 a `path`, conservando la query string de la request: es donde vienen los
 * parámetros de campaña, y perderlos en el traslado rompe la atribución de cada enlace ya publicado
 * hacia afuera.
 */
function redirectKeepingQuery(c: Context, path: string): Response {
	return c.redirect(`${path}${new URL(c.req.url).search}`, 301);
}

/**
 * Arma el handler de detalle de una sección, preservando el slug y la query string.
 *
 * El slug vuelve a codificarse antes de componer el destino: llega ya decodificado desde el router,
 * así que uno que contenga un carácter reservado produciría un `Location` con una ruta distinta de la
 * pedida —y, en el peor caso, con otro host.
 */
function legacyDetailRedirect(sectionPath: string): Handler<BlankEnv, '/:slug'> {
	return (c) => redirectKeepingQuery(c, `${sectionPath}/${encodeURIComponent(c.req.param('slug'))}`);
}

export const legacyHomeRedirect: Handler = (c) => redirectKeepingQuery(c, '/');
export const legacyStoryListingRedirect: Handler = (c) => c.redirect('/literary-work', 301);
export const legacyStorylistListingRedirect: Handler = (c) => c.redirect('/collection', 301);
export const legacyStoryDetailRedirect = legacyDetailRedirect('/literary-work');
export const legacyStorylistDetailRedirect = legacyDetailRedirect('/collection');
