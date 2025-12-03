// Hono: Imports y configuración
import { Hono } from 'hono';

// Funciones de service
import { getAllAuthors, getAuthorBySlug } from './author.service';

const authorController = new Hono();

authorController.get('/', async (c) => {
	const result = await getAllAuthors();
	return c.json(result);
});

authorController.get('/:slug', async (c) => {
	const slug = c.req.param('slug');
	const result = await getAuthorBySlug(slug);
	return c.json(result);
});

export default authorController;
