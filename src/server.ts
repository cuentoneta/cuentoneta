import { join } from 'node:path';
import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import { isMainModule } from '@angular/ssr/node';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';
import apiRoutes from './api/routes';

/**
 * Inicializa Hono y exporta la instancia de la aplicación
 */
export const app = new Hono({ strict: false }).use(requestId()).use(secureHeaders());
const angularApp = new AngularAppEngine();

// Registra rutas de API
app.route('/api', apiRoutes);

/**
 * Sirve los archivos estáticos desde el directorio /browser
 */
app.use(
	'*',
	serveStatic({
		root: join(import.meta.dirname, '../browser'),
		onFound: (path, c) => {
			// Cache largo solo para assets con hash en el nombre
			if (path.match(/\.[a-f0-9]{8,}\.(js|css|png|jpg|webp|woff2?)$/)) {
				c.header('Cache-Control', 'public, immutable, max-age=31536000');
			} else {
				// 1 hora para otros
				c.header('Cache-Control', 'public, max-age=3600');
			}
		},
		onNotFound: () => {},
	}),
);

/**
 * Maneja el SSR para las routes restantes utilizando el Angular App Engine
 */
app.use('*', async (c, next) => {
	const response = await angularApp.handle(c.req.raw);
	if (response) {
		return response;
	}

	return next();
});

/**
 * Handler para Error 404: Not Found
 */
app.notFound((c) => {
	return c.text('404 - Not found', 404);
});

/**
 * Handler para Error 500: Internal Server Error
 */
app.onError((error, c) => {
	console.error('Server Error:', error);
	const isDev = process.env['NODE_ENV'] !== 'production';
	const message = isDev ? error.message : 'Internal Server Error';
	return c.json({ error: message }, 500);
});

/**
 * Inicia el server si este módulo es el punto principal de entrada.
 * El servidor escucha en el puerto definido por el valor `PORT` definido
 * en las variables de entorno, usando 4000 como default.
 */
if (isMainModule(import.meta.url)) {
	const port = Number(process.env['PORT'] || 4000);
	serve(
		{
			fetch: app.fetch,
			port,
		},
		(info) => {
			console.log(`Aplicación corriendo en http://localhost:${info.port}`);
		},
	);
}

/**
 * Request handler utilizado por Angular CLI para modos dev-server y durante build
 * o en Firebase Cloud Functions.
 */
export const reqHandler = createRequestHandler(app.fetch);
