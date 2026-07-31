import { Hono } from 'hono';
import { environment } from '../_helpers/environment';
import { ssrCacheControl } from './ssr-cache-control.middleware';

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
		app.get('/read/ssr', (c) => c.html('<html ng-server-context="ssr"><body>obra</body></html>'));
		app.get('/read/csr', (c) => c.html('<html ng-server-context="csr"><body></body></html>'));
		app.get('/read/missing', (c) => c.text('no existe', 404));
		return app;
	}

	it('setea Cache-Control cacheable ante un 200 SSR real en producción', async () => {
		environment.production = true;

		const response = await appUnderTest().request('/read/ssr');

		expect(response.headers.get('Cache-Control')).toContain('public, s-maxage=');
		expect(response.headers.get('Cache-Control')).toContain('stale-while-revalidate=604800');
	});

	it('no cachea el fallback CSR degradado (200 sin el marcador de SSR)', async () => {
		environment.production = true;

		const response = await appUnderTest().request('/read/csr');

		expect(response.headers.get('Cache-Control')).toBeNull();
	});

	it('no cachea en entornos no productivos aunque el body sea SSR real', async () => {
		environment.production = false;

		const response = await appUnderTest().request('/read/ssr');

		expect(response.headers.get('Cache-Control')).toBeNull();
	});

	it('no cachea respuestas no-200 (404)', async () => {
		environment.production = true;

		const response = await appUnderTest().request('/read/missing');

		expect(response.headers.get('Cache-Control')).toBeNull();
	});

	it('preserva el body de la respuesta downstream', async () => {
		environment.production = true;

		const response = await appUnderTest().request('/read/ssr');

		expect(await response.text()).toContain('obra');
	});

	it('refleja el valor del interruptor de s-maxage en el header', async () => {
		environment.production = true;
		environment.readCacheSMaxAge = 31536000;

		const response = await appUnderTest().request('/read/ssr');

		expect(response.headers.get('Cache-Control')).toContain('s-maxage=31536000');
	});
});
