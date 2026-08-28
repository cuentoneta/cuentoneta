import type { Handler } from 'hono';
import type { BlankEnv } from 'hono/types';

/**
 * Las URLs indexadas de la plataforma se mudaron: el listado y el detalle de obra a `/literary-work`
 * y `/read/:slug`, y los de colección a `/collection` y `/collection/:slug`. La mudanza tiene que
 * viajar en la respuesta HTTP y no en el router del cliente: un crawler que no ejecuta JavaScript
 * solo ve el 301, y es el 301 —no un alias— lo que traslada lo que la ruta vieja tenga indexado.
 *
 * Son handlers terminales y no middlewares: responden en vez de ceder a `next()`, a diferencia del
 * resto de esta carpeta.
 *
 * Los destinos van como literales porque `src/api/**` no importa `AppRoutes`, que es del frontend.
 */

/**
 * Arma el handler de detalle de una sección, preservando el segmento de slug.
 *
 * El slug vuelve a codificarse antes de componer el destino: llega ya decodificado desde el router,
 * así que uno que contenga un carácter reservado produciría un `Location` con una ruta distinta de
 * la pedida.
 */
function legacyDetailRedirect(sectionPath: string): Handler<BlankEnv, '/:slug'> {
	return (c) => c.redirect(`${sectionPath}/${encodeURIComponent(c.req.param('slug'))}`, 301);
}

export const legacyStoryListingRedirect: Handler = (c) => c.redirect('/literary-work', 301);
export const legacyStorylistListingRedirect: Handler = (c) => c.redirect('/collection', 301);
export const legacyStoryDetailRedirect = legacyDetailRedirect('/read');
export const legacyStorylistDetailRedirect = legacyDetailRedirect('/collection');
