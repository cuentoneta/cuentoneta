import { Hono, type Context } from 'hono';
import { zValidator } from '@hono/zod-validator';

import { addWeeksSchema } from './content.schema';
import { LandingPageNotFoundError, MalformedLandingPageError } from './content.errors';
import type { ContentRepository } from './content.repository';
import { addNextWeeksLandingPageContent, getLandingPageContent } from './content.service';

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

	controller.get('/landing-page', async (c) => respond(c, () => getLandingPageContent(repository)));

	/**
	 * Endpoint encargado de agregar instancias de documentos landingPage para las próximas semanas, a fin de generar automáticamente
	 * los documentos que luego son modificados manualmente para actualizar el contenido de la landing page desde Sanity Studio
	 */
	controller.get('/add-next-weeks-landing-page-content', zValidator('query', addWeeksSchema), async (c) => {
		const { weeksInTheFuture } = c.req.valid('query');
		// El `no-store` no es decorativo: el módulo sirve sus lecturas con caché de borde, y sin
		// declararse incacheable esta escritura recibiría el mismo tratamiento y la invocación siguiente
		// se resolvería con un hit, devolviendo un 200 sin haber creado ningún documento.
		c.header('Cache-Control', 'no-store');
		return respond(c, () => addNextWeeksLandingPageContent(weeksInTheFuture, repository));
	});

	return controller;
}

const contentController = createContentController();
export default contentController;
