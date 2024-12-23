import {
	AngularNodeAppEngine,
	createNodeRequestHandler,
	isMainModule,
	writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import routes from './api/routes';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

export function app(): express.Express {
	const server = express();
	const angularApp = new AngularNodeAppEngine();

	// Registra las routes utilizadas por la API
	for (const route of routes) {
		server.use(`/api${route.path}`, route.controller);
	}

	/**
	 * Serve static files from /browser
	 */
	server.use(
		express.static(browserDistFolder, {
			maxAge: '1y',
			index: false,
			redirect: false,
		}),
	);

	/**
	 * Handle all other requests by rendering the Angular application.
	 */
	server.use('/**', (req, res, next) => {
		angularApp
			.handle(req)
			.then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
			.catch(next);
	});

	return server;
}

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
const server = app();
if (isMainModule(import.meta.url)) {
	const port = process.env['PORT'] || 4000;
	server.listen(port, () => {
		console.log(`Aplicación corriendo en http://localhost:${port}`);
	});
}

/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createNodeRequestHandler(server);
