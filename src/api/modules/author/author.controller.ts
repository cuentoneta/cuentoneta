// Hono: Imports y configuración
import { Hono } from 'hono';

import { slugParamValidator } from '../../_middleware/slug-param-validator.middleware';
import { AuthorNotFoundError } from './author.errors';

// Funciones de service
import { getAllAuthors, getAuthorBySlug } from './author.service';

const authorController = new Hono();

authorController.get('/', async (c) => {
	const result = await getAllAuthors();
	return c.json(result);
});

authorController.get(
	'/:slug',
	slugParamValidator((slug) => new AuthorNotFoundError(slug)),
	async (c) => {
		const { slug } = c.req.valid('param');
		const result = await getAuthorBySlug(slug);

		return c.json(result);
	},
);

export default authorController;
