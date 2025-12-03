// Hono: Imports y configuración
import { Hono } from 'hono';

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
storyController.get('/most-read', async (c) => {
	const limit = parseInt(c.req.query('limit') ?? '6');
	const offset = parseInt(c.req.query('offset') ?? '0');
	const result = await getMostReadStoryNavigationTeasers(limit, offset);
	return c.json(result);
});

storyController.get('/update-most-read', async (c) => {
	const result = await updateMostReadStories();
	return c.json(result);
});

storyController.get('/author/:slug/navigation', async (c) => {
	const slug = c.req.param('slug');
	const limit = parseInt(c.req.query('limit') ?? '100');
	const offset = parseInt(c.req.query('offset') ?? '0');
	const result = await getStoryNavigationTeaserByAuthorSlug({ slug, limit, offset });
	return c.json(result);
});

storyController.get('/author/:slug', async (c) => {
	const slug = c.req.param('slug');
	const limit = parseInt(c.req.query('limit') ?? '100');
	const offset = parseInt(c.req.query('offset') ?? '0');
	const args: StoriesByAuthorSlugArgs = { slug, limit, offset };
	const result = await getStoriesByAuthorSlug(args);
	return c.json(result);
});

// WILDCARD ROUTES LAST
/**
 * Obtiene la lista completa de stories, usando paginación para la consulta
 */
storyController.get('/', async (c) => {
	const limit = parseInt(c.req.query('limit') ?? '100');
	const offset = parseInt(c.req.query('offset') ?? '0');
	const result = await getStories(limit, offset);
	return c.json(result);
});

storyController.get('/:slug', async (c) => {
	const slug = c.req.param('slug');
	const result = await getStoryBySlug(slug);
	return c.json(result);
});

export default storyController;
