// Hono: Imports y configuración
import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

// Esquemas de zod
import { paginationSchema, storylistQuerySchema } from './storylist.schema';
import { slugSchema } from 'src/api/schemas/common.schemas';

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
storylistController.get(
	'/:slug/navigation',
	zValidator('param', slugSchema),
	zValidator('query', paginationSchema),
	async (c) => {
		const { slug } = c.req.valid('param');
		const { limit, offset } = c.req.valid('query');

		const result = await getStorylistNavigationTeasersByStorylistSlug({ slug, limit, offset });
		return c.json(result);
	},
);

storylistController.get(
	'/:slug',
	zValidator('param', slugSchema),
	zValidator('query', storylistQuerySchema),
	async (c) => {
		const { slug } = c.req.valid('param');
		const { amount, ordering } = c.req.valid('query');

		const limit = amount ? parseInt(amount) - 1 : 0;
		const result = await getStorylistBySlug({ slug, amount: amount ?? '0', limit, ordering });
		return c.json(result);
	},
);

export default storylistController;
