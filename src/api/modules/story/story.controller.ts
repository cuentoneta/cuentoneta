// Hono: Imports y configuración
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

// Esquemas de zod
import { mostReadStorySchema, storyControllerSchema } from './story.schema';
import { slugSchema } from 'src/api/schemas/common.schemas';

import { StoriesByAuthorSlugArgs } from '../../interfaces/queryArgs';
import {
	getMostReadStoryNavigationTeasers,
	getStories,
	getStoriesByAuthorSlug,
	getStoryBySlug,
	getStoryNavigationTeaserByAuthorSlug,
	updateMostReadStories,
} from './story.service';

const storyController = new Hono();

// SPECIFIC ROUTES FIRST (before /:slug wildcard)
storyController.get('/most-read', zValidator('query', mostReadStorySchema), async (c) => {
	const { limit, offset } = c.req.valid('query');
	const result = await getMostReadStoryNavigationTeasers(limit, offset);
	return c.json(result);
});

storyController.get('/update-most-read', async (c) => {
	const result = await updateMostReadStories();
	return c.json(result);
});

storyController.get(
	'/author/:slug/navigation',
	zValidator('param', slugSchema),
	zValidator('query', storyControllerSchema),
	async (c) => {
		const { slug } = c.req.valid('param');
		const { limit, offset } = c.req.valid('query');

		const result = await getStoryNavigationTeaserByAuthorSlug({ slug, limit, offset });
		return c.json(result);
	},
);

storyController.get(
	'/author/:slug',
	zValidator('param', slugSchema),
	zValidator('query', storyControllerSchema),
	async (c) => {
		const { slug } = c.req.valid('param');
		const { limit, offset } = c.req.valid('query');

		const args: StoriesByAuthorSlugArgs = { slug, limit, offset };
		const result = await getStoriesByAuthorSlug(args);
		return c.json(result);
	},
);

// WILDCARD ROUTES LAST
/**
 * Obtiene la lista completa de stories, usando paginación para la consulta
 */
storyController.get('/', zValidator('query', storyControllerSchema), async (c) => {
	const { limit, offset } = c.req.valid('query');

	const result = await getStories(limit, offset);
	return c.json(result);
});

storyController.get('/:slug', zValidator('param', slugSchema), async (c) => {
	const { slug } = c.req.valid('param');

	const result = await getStoryBySlug(slug);
	return c.json(result);
});

export default storyController;
