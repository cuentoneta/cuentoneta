import { Hono } from 'hono';
import { generateSitemap } from './sitemap.service';
import { logger } from '../../_utils/logger';

const sitemapController = new Hono();

/**
 * Genera un sitemap XML dinámico para el sitio
 * Obtiene todo el contenido publicado de Sanity y crea entradas de URL
 */
sitemapController.get('/', async (c) => {
	try {
		const sitemap = await generateSitemap();
		return c.body(sitemap, 200, {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=21600', // Cache de 6 horas
			'X-Content-Type-Options': 'nosniff',
		});
	} catch (error) {
		const err = error instanceof Error ? error : new Error(String(error));
		logger.error('[Sitemap] Error generating sitemap:', {
			message: err.message,
			stack: err.stack,
		});
		return c.body('Error generating sitemap', 500);
	}
});

export default sitemapController;
