// Hono: Imports y configuración
import { Hono } from 'hono';

// Funciones de service
import {
	getStorylistBySlug,
	getAllStorylistTeasers,
	getStorylistNavigationTeasersByStorylistSlug,
} from './storylist.service';

const storylistController = new Hono();

// Controllers
storylistController.get('/teasers', async (c) => {
	const result = await getAllStorylistTeasers();
	return c.json(result);
});

/**
 * Obtiene los teasers de las publicaciones de una storylist para su uso en la navegación de la misma.
 */
storylistController.get('/:slug/navigation', async (c) => {
	const slug = c.req.param('slug');
	const limit = parseInt(c.req.query('limit') ?? '100');
	const offset = parseInt(c.req.query('offset') ?? '0');
	const result = await getStorylistNavigationTeasersByStorylistSlug({ slug, limit, offset });
	return c.json(result);
});

storylistController.get('/:slug', async (c) => {
	const slug = c.req.param('slug');
	const amount = c.req.query('amount');
	const ordering = c.req.query('ordering') ?? 'asc';
	const limit = amount ? parseInt(amount) - 1 : 0;
	const result = await getStorylistBySlug({ slug, amount: amount ?? '0', limit, ordering });
	return c.json(result);
});

export default storylistController;
