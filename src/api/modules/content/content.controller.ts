// Hono: Imports y configuración
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

// Esquemas de zod
import { addWeeksSchema } from './content.schema';

// Funciones de service
import { addNextWeeksLandingPageContent, getLandingPageContent } from './content.service';

const contentController = new Hono();

contentController.get('/landing-page', async (c) => {
	const result = await getLandingPageContent();
	return c.json(result);
});

/**
 * Endpoint encargado de agregar instancias de documentos landingPage para las próximas semanas, a fin de generar automáticamente
 * los documentos que luego son modificados manualmente para actualizar el contenido de la landing page desde Sanity Studio
 */

contentController.get('/add-next-weeks-landing-page-content', zValidator('query', addWeeksSchema), async (c) => {
	const { weeksInTheFuture } = c.req.valid('query');
	const result = await addNextWeeksLandingPageContent(weeksInTheFuture);
	return c.json(result);
});

export default contentController;
