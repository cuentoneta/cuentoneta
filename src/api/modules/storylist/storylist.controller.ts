// Hono: Imports y configuración
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

// Esquemas de zod
import { storylistQuerySchema } from './storylist.schema';
import { slugSchema } from '@schemas/common.schemas';

// Funciones de service
import { getStorylistBySlug, getAllStorylistTeasers } from './storylist.service';

const storylistController = new Hono();

// Controllers
storylistController.get('/teasers', async (c) => {
	const result = await getAllStorylistTeasers();
	return c.json(result);
});

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
