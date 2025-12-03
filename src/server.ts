import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import { isMainModule } from '@angular/ssr/node';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import apiRoutes from './api/routes';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

export const app = new Hono();

// Register API routes with /api prefix
app.route('/api', apiRoutes);

// Serve static files with cache headers
app.use('/*', async (c, next) => {
	await next();

	// Add 1-year cache for static assets (matching Express behavior)
	const path = c.req.path;
	if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp)$/)) {
		c.header('Cache-Control', 'public, max-age=31536000, immutable');
	}
});

app.use(
	'/*',
	serveStatic({
		root: browserDistFolder,
		index: '', // Disable auto index.html
	}),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use('/*', async (c, next) => {
	const angularApp = new AngularAppEngine();
	const response = await angularApp.handle(c.req.raw);

	if (response) {
		return response;
	}

	return next();
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
	const port = parseInt(process.env['PORT'] || '4000');
	serve({ fetch: app.fetch, port }, (info) => {
		console.log(`Aplicación corriendo en http://localhost:${info.port}`);
	});
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build)
 * or Vercel serverless.
 */
export const reqHandler = createRequestHandler(app.fetch);

/**
 * Export for Vercel serverless
 */
export default app;
