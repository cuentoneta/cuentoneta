// Hono: Imports y configuración
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

// Esquemas de zod
import { slugSchema } from '../../schemas/common.schemas';

// Funciones de service
import { getAllAuthors, getAuthorBySlug } from './author.service';

const authorController = new Hono();

authorController.get('/', async (c) => {
	const result = await getAllAuthors();
	return c.json(result);
});

authorController.get('/:slug', zValidator('param', slugSchema), async (c) => {
	const { slug } = c.req.valid('param');
	const result = await getAuthorBySlug(slug);

	return c.json(result);
});

export default authorController;
