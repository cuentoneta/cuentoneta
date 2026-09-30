import { Hono, type Context } from 'hono';

import { LandingPageNotFoundError, MalformedLandingPageError } from './content.errors';
import type { ContentRepository } from './content.repository';
import { getLandingPageContent } from './content.service';
import { applyLandingPageCacheHeaders } from '../../_helpers/cache-control';

/** Traduce los errores del módulo al status que le corresponde a cada uno. */
async function respond<T>(c: Context, produce: () => Promise<T>) {
	try {
		return c.json(await produce());
	} catch (error) {
		if (error instanceof LandingPageNotFoundError) {
			return c.json({ error: error.message }, 404);
		}
		if (error instanceof MalformedLandingPageError) {
			// Se loguea antes de traducir porque la respuesta no lleva la causa: sin este registro, qué dato
			// y qué invariante lo produjeron mueren acá y el 500 no dice qué corregir en el Studio.
			console.error('content.controller: la página de inicio no se pudo construir', {
				message: error.message,
				cause: error.cause,
			});
			// Responde un código y no el mensaje: ese mensaje nombra el documento culpable, que es
			// información de la redacción y no del cliente.
			return c.json({ error: 'landing_page_malformed' }, 500);
		}
		throw error;
	}
}

export function createContentController(repository?: ContentRepository) {
	const controller = new Hono();

	controller.get('/landing-page', async (c) =>
		applyLandingPageCacheHeaders(await respond(c, () => getLandingPageContent(repository))),
	);

	return controller;
}

const contentController = createContentController();
export default contentController;
