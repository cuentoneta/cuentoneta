import { Hono } from 'hono';
import { generateSitemapXml, getSitemapUrls } from './sitemap.service';

const sitemapController = new Hono();

/**
 * Genera un sitemap XML dinámico para el sitio
 * Obtiene todo el contenido publicado de Sanity y crea entradas de URL
 */
sitemapController.get('/', async (c) => {
	try {
		const urls = await getSitemapUrls();
		const sitemap = generateSitemapXml(urls);

		return c.body(sitemap, 200, {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600', // Cache de 1 hora
		});
	} catch (error) {
		console.error('Error generating sitemap:', error);
		return c.body('Error generating sitemap', 500);
	}
});

export default sitemapController;
