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
		app.get('/read/la-obra', (c) => c.html('<html ng-server-context="ssr"><body>obra</body></html>'));
		app.get('/read/csr', (c) => c.html('<html ng-server-context="csr"><body></body></html>'));
		app.get('/read/missing', (c) => c.text('no existe', 404));
		return app;
	}

	it('cachea en el CDN un 200 SSR real en producción, con el s-maxage del interruptor', async () => {
		environment.production = true;
		environment.readCacheSMaxAge = 31536000;

		const response = await appUnderTest().request('/read/la-obra');

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toBe(
			'public, s-maxage=31536000, stale-while-revalidate=604800',
		);
	});

	it('mantiene el browser fresco y etiqueta la respuesta por slug', async () => {
		environment.production = true;

		const response = await appUnderTest().request('/read/la-obra');

		expect(response.headers.get('Cache-Control')).toBe('public, max-age=0, must-revalidate');
		expect(response.headers.get('Vercel-Cache-Tag')).toBe('literary-work:la-obra');
	});

	it('no cachea el fallback CSR degradado (200 sin el marcador de SSR)', async () => {
		environment.production = true;

		const response = await appUnderTest().request('/read/csr');

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toBeNull();
		expect(response.headers.get('Vercel-Cache-Tag')).toBeNull();
	});

	it('no cachea en entornos no productivos aunque el body sea SSR real', async () => {
		environment.production = false;

		const response = await appUnderTest().request('/read/la-obra');

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toBeNull();
	});

	it('no cachea respuestas no-200 (404)', async () => {
		environment.production = true;

		const response = await appUnderTest().request('/read/missing');

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toBeNull();
	});

	it('preserva el body de la respuesta downstream', async () => {
		environment.production = true;

		const response = await appUnderTest().request('/read/la-obra');

		expect(await response.text()).toContain('obra');
	});
});
