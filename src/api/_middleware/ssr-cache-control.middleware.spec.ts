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
		app.use('/read/*', ssrCacheControl);
		app.get('/read/la-obra', (c) => c.html('<html ng-server-context="ssr"><body>obra</body></html>'));
		app.get('/read/csr', (c) => c.html('<html ng-server-context="csr"><body></body></html>'));
		app.get('/read/missing', (c) => c.text('no existe', 404));
		app.get('/read/streamed', () => streamedHtml('<html ng-server-context="ssr"><body>obra en stream</body></html>'));
		return app;
	}

	it('should cache a real SSR 200 at the CDN using the configured s-maxage', async () => {
		environment.production = true;
		environment.readCacheSMaxAge = 600;

		const response = await appUnderTest().request('/read/la-obra');

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toBe(
			'public, s-maxage=600, stale-while-revalidate=604800',
		);
	});

	it('should keep the browser copy fresh', async () => {
		environment.production = true;

		const response = await appUnderTest().request('/read/la-obra');

		expect(response.headers.get('Cache-Control')).toBe('public, max-age=0, must-revalidate');
	});

	it('should not cache the degraded CSR fallback (a 200 without the SSR marker)', async () => {
		environment.production = true;

		const response = await appUnderTest().request('/read/csr');

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toBeNull();
	});

	it('should not cache outside production even when the body is real SSR', async () => {
		environment.production = false;

		const response = await appUnderTest().request('/read/la-obra');

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toBeNull();
	});

	it('should not cache non-200 responses', async () => {
		environment.production = true;

		const response = await appUnderTest().request('/read/missing');

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toBeNull();
	});

	it('should preserve the downstream response body', async () => {
		environment.production = true;

		const response = await appUnderTest().request('/read/la-obra');

		expect(await response.text()).toContain('obra');
	});

	it('should cache a streamed SSR response and still deliver its whole body', async () => {
		environment.production = true;

		const response = await appUnderTest().request('/read/streamed');

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toContain('s-maxage=');
		expect(await response.text()).toBe('<html ng-server-context="ssr"><body>obra en stream</body></html>');
	});

	// La guarda anti-CSR busca el marcador `ssr`, que Angular solo emite bajo `RenderMode.Server`:
	// pasar la ruta a `Prerender` la haría emitir `ssg` y el cacheo se apagaría sin señal.
	it('should keep /read/:slug declared as a server-rendered route', () => {
		const readRoute = serverRoutes.find((route) => route.path === `${AppRoutes.Read}/:slug`);

		expect(readRoute?.renderMode).toBe(RenderMode.Server);
	});
});
