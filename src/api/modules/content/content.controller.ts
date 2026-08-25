import { Hono, type Context } from 'hono';
import { zValidator } from '@hono/zod-validator';

import { addWeeksSchema } from './content.schema';
import { LandingPageNotFoundError, MalformedLandingPageError } from './content.errors';
import type { ContentRepository } from './content.repository';
import { addNextWeeksLandingPageContent, getLandingPageContent } from './content.service';

// El error de curaduría responde con un código y no con su mensaje: ese mensaje nombra el documento
// culpable, que es información de la redacción y no del cliente.
async function respond<T>(c: Context, produce: () => Promise<T>) {
	try {
		return c.json(await produce());
	} catch (error) {
		if (error instanceof LandingPageNotFoundError) {
			return c.json({ error: error.message }, 404);
		}
		if (error instanceof MalformedLandingPageError) {
			return c.json({ error: 'landing_page_malformed' }, 500);
		}
		throw error;
	}
}

export function createContentController(repository?: ContentRepository) {
	const controller = new Hono();

	controller.get('/landing-page', async (c) => respond(c, () => getLandingPageContent(repository)));

	/**
	 * Endpoint encargado de agregar instancias de documentos landingPage para las próximas semanas, a fin de generar automáticamente
	 * los documentos que luego son modificados manualmente para actualizar el contenido de la landing page desde Sanity Studio
	 */
	controller.get('/add-next-weeks-landing-page-content', zValidator('query', addWeeksSchema), async (c) => {
		const { weeksInTheFuture } = c.req.valid('query');
		return respond(c, () => addNextWeeksLandingPageContent(weeksInTheFuture, repository));
	});

	return controller;
}

const contentController = createContentController();
export default contentController;
