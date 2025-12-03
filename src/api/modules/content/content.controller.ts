// Hono: Imports y configuración
import { Hono } from 'hono';

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
contentController.get('/add-next-weeks-landing-page-content', async (c) => {
	const weeksInTheFuture = parseInt(c.req.query('weeksInTheFuture') ?? '4');
	const result = await addNextWeeksLandingPageContent(weeksInTheFuture);
	return c.json(result);
});

export default contentController;
