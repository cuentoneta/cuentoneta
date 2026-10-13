import { Hono } from 'hono';
import { generateLegacySitemap } from './sitemap-legacy.service';

export function createSitemapLegacyController(generate: () => Promise<string> = generateLegacySitemap): Hono {
	const controller = new Hono();

	controller.get('/', async (c) => {
		try {
			return c.body(await generate(), 200, {
				'Content-Type': 'application/xml',
				'Cache-Control': 'public, max-age=21600', // Cache de 6 horas
				'X-Content-Type-Options': 'nosniff',
			});
		} catch (error) {
			const err = error instanceof Error ? error : new Error(String(error));
			console.error('[SitemapLegacy] Error generating sitemap:', { message: err.message, stack: err.stack });
			return c.body('Error generating sitemap', 500);
		}
	});

	return controller;
}

export default createSitemapLegacyController();
