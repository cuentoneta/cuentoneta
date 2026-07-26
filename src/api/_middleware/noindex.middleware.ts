import { createMiddleware } from 'hono/factory';
import { environment } from '../_helpers/environment';

/**
 * Emite `X-Robots-Tag: noindex, nofollow` en despliegues no productivos (staging, previews) para
 * sacarlos del índice. `noindex` des-indexa lo ya indexado; un `Disallow` solo frena el crawl.
 * En producción no agrega el header y el sitio sigue indexable.
 */
export const noindexNonProduction = createMiddleware(async (c, next) => {
	await next();
	if (!environment.production) {
		c.header('X-Robots-Tag', 'noindex, nofollow');
	}
});
