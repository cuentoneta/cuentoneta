import { Hono } from 'hono';
import { readCacheHeaders } from './_middleware/read-cache-headers.middleware';
import authorController from './modules/author/author.controller';
import collectionController from './modules/collection/collection.controller';
import contentController from './modules/content/content.controller';
import contributorController from './modules/contributor/contributor.controller';
import literaryWorkController from './modules/literary-work/literary-work.controller';
import ogController from './og.controller';

const apiRoutes = new Hono();

/**
 * Los módulos cuyas lecturas se sirven desde la caché de borde.
 *
 * Es todo lo que un crawler recorre: el sitemap publica cerca de mil URLs, y sin esta capa cada
 * visita a cualquiera de ellas vuelve a consultar a Sanity. Queda afuera `/og`, cuya caché es otra
 * decisión.
 *
 * El registro va por par —el recurso y lo que cuelga de él— porque el comodín de Hono exige al menos
 * un segmento: `/x/*` deja fuera al catálogo `/x`. Cada `GET` que en realidad escribe se declara
 * `no-store` en su propio handler; el middleware lo respeta.
 *
 * **Va antes del montaje de los controllers, y el orden es parte del mecanismo:** los handlers no
 * llaman `next()`, así que un middleware registrado después de ellos no correría nunca y la caché se
 * apagaría en silencio. Lo afirma `routes.spec.ts`.
 */
const CACHED_MODULES = ['/author', '/collection', '/content', '/contributor', '/literary-work'];

for (const module of CACHED_MODULES) {
	apiRoutes.on('GET', [module, `${module}/*`], readCacheHeaders);
}

apiRoutes.route('/author', authorController);
apiRoutes.route('/collection', collectionController);
apiRoutes.route('/contributor', contributorController);
apiRoutes.route('/content', contentController);
apiRoutes.route('/literary-work', literaryWorkController);
apiRoutes.route('/og', ogController);

export default apiRoutes;
