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

	it('should cache a real SSR 200 at the CDN using the configured s-maxage', async () => {
		environment.production = true;
		environment.readCacheSMaxAge = 31536000;

		const response = await appUnderTest().request('/read/la-obra');

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toBe(
			'public, s-maxage=31536000, stale-while-revalidate=604800',
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
});
