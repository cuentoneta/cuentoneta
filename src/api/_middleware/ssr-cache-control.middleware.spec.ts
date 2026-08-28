import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { RenderMode } from '@angular/ssr';
import { Hono } from 'hono';
import { AppRoutes } from '../../app/app.routes';
import { serverRoutes } from '../../app/app.routes.server';
import { environment } from '../_helpers/environment';
import { ssrCacheControl } from './ssr-cache-control.middleware';

// La respuesta que el middleware envuelve en producción no la crea Hono sino `angularApp.handle()`,
// y puede venir como stream. Ahí viven las dos mecánicas delicadas: el tee del `clone()` y la
// re-creación de la `Response` que hace `c.header()` sobre una respuesta ya finalizada.
function streamedHtml(html: string): Response {
	const stream = new ReadableStream({
		start(controller) {
			const encoder = new TextEncoder();
			for (const chunk of [html.slice(0, 20), html.slice(20)]) {
				controller.enqueue(encoder.encode(chunk));
			}
			controller.close();
		},
	});

	return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/html' } });
}

describe('ssrCacheControl', () => {
	const originalProduction = environment.production;
	const originalSMaxAge = environment.readCacheSMaxAge;

	afterEach(() => {
		environment.production = originalProduction;
		environment.readCacheSMaxAge = originalSMaxAge;
	});

	function appUnderTest(): Hono {
		const app = new Hono();
		app.use('/literary-work/*', ssrCacheControl);
		app.get('/literary-work/la-obra', (c) => c.html('<html ng-server-context="ssr"><body>obra</body></html>'));
		app.get('/literary-work/csr', (c) => c.html('<html ng-server-context="csr"><body></body></html>'));
		app.get('/literary-work/missing', (c) => c.text('no existe', 404));
		app.get('/literary-work/streamed', () =>
			streamedHtml('<html ng-server-context="ssr"><body>obra en stream</body></html>'),
		);
		// La home es la ruta donde el deopt a CSR ya ocurrió en producción, así que es donde la guarda
		// anti-CSR tiene que estar probada: cachear ese fallback serviría una página vacía por siete días.
		app.use('/home', ssrCacheControl);
		app.get('/home', (c) => c.html('<html ng-server-context="ssr"><body>inicio</body></html>'));
		return app;
	}

	it('should cache a real SSR 200 at the CDN using the configured s-maxage', async () => {
		environment.production = true;
		environment.readCacheSMaxAge = 600;

		const response = await appUnderTest().request('/literary-work/la-obra');

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toBe(
			'public, s-maxage=600, stale-while-revalidate=604800',
		);
	});

	it('should keep the browser copy fresh', async () => {
		environment.production = true;

		const response = await appUnderTest().request('/literary-work/la-obra');

		expect(response.headers.get('Cache-Control')).toBe('public, max-age=0, must-revalidate');
	});

	it('should not cache the degraded CSR fallback (a 200 without the SSR marker)', async () => {
		environment.production = true;

		const response = await appUnderTest().request('/literary-work/csr');

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toBeNull();
	});

	it('should not cache outside production even when the body is real SSR', async () => {
		environment.production = false;

		const response = await appUnderTest().request('/literary-work/la-obra');

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toBeNull();
	});

	it('should not cache non-200 responses', async () => {
		environment.production = true;

		const response = await appUnderTest().request('/literary-work/missing');

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toBeNull();
	});

	it('should preserve the downstream response body', async () => {
		environment.production = true;

		const response = await appUnderTest().request('/literary-work/la-obra');

		expect(await response.text()).toContain('obra');
	});

	it('should cache a streamed SSR response and still deliver its whole body', async () => {
		environment.production = true;

		const response = await appUnderTest().request('/literary-work/streamed');

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toContain('s-maxage=');
		expect(await response.text()).toBe('<html ng-server-context="ssr"><body>obra en stream</body></html>');
	});

	// Las rutas cacheadas y el prefijo con el que se montan, apareados: cada entrada es lo que hay que
	// mantener sincronizado entre `app.routes.server.ts` y `server.ts`.
	const CACHED_SSR_ROUTES = [
		{ route: AppRoutes.Home, mount: `'/${AppRoutes.Home}'` },
		{ route: AppRoutes.About, mount: `'/${AppRoutes.About}'` },
		{ route: AppRoutes.Collection, mount: `'/${AppRoutes.Collection}'` },
		{ route: `${AppRoutes.Collection}/:slug`, mount: `'/${AppRoutes.Collection}/*'` },
		{ route: `${AppRoutes.Author}/:slug`, mount: `'/${AppRoutes.Author}/*'` },
		{ route: `${AppRoutes.LiteraryWork}/:slug`, mount: `'/${AppRoutes.LiteraryWork}/*'` },
	];

	// La guarda anti-CSR busca el marcador `ssr`, que Angular solo emite bajo `RenderMode.Server`:
	// pasar una de estas rutas a `Prerender` la haría emitir `ssg` y el cacheo se apagaría sin señal.
	it.each(CACHED_SSR_ROUTES)('should keep $route declared as a server-rendered route', ({ route }) => {
		expect(serverRoutes.find(({ path }) => path === route)?.renderMode).toBe(RenderMode.Server);
	});

	// El montaje vive en `server.ts` y ningún test lo alcanza: los de arriba arman su propio Hono. Un
	// prefijo que dejara de coincidir con la ruta no rompe nada — la caché simplemente deja de
	// aplicarse—, así que se afirma leyendo la fuente, como hace el guardrail de directivas SEO.
	it.each(CACHED_SSR_ROUTES)('should stay mounted on $mount', ({ mount }) => {
		const source = readFileSync(join(process.cwd(), 'src/server.ts'), 'utf-8');
		// La línea, no el archivo: buscar la cadena en el texto entero daría verde con el montaje
		// comentado, que es justo la forma en que la caché se apagaría sin que nada más lo note.
		const registration = source
			.split('\n')
			.find((line) => line.includes('ssrCacheControl)') && !line.trimStart().startsWith('//'));

		expect(registration).toContain(mount);
	});
});
