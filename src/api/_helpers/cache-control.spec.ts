import { Hono } from 'hono';
import { applyLandingPageCacheHeaders, applyReadCacheHeaders, isReadCacheEnabled } from './cache-control';
import { environment } from './environment';

describe('cache-control', () => {
	const originalProduction = environment.production;
	const originalSMaxAge = environment.readCacheSMaxAge;

	afterEach(() => {
		environment.production = originalProduction;
		environment.readCacheSMaxAge = originalSMaxAge;
	});

	function appUnderTest(): Hono {
		const app = new Hono();
		app.get('/anything', (c) => {
			c.header('x-request-id', 'the-first-request');
			applyReadCacheHeaders(c);
			return c.text('ok');
		});
		return app;
	}

	describe('isReadCacheEnabled', () => {
		it('should be enabled in production', () => {
			environment.production = true;

			expect(isReadCacheEnabled()).toBe(true);
		});

		it('should be disabled outside production', () => {
			environment.production = false;

			expect(isReadCacheEnabled()).toBe(false);
		});
	});

	describe('applyReadCacheHeaders', () => {
		it('should emit the full CDN directive with the configured s-maxage', async () => {
			environment.production = true;
			environment.readCacheSMaxAge = 900;

			const response = await appUnderTest().request('/anything');

			expect(response.headers.get('Vercel-CDN-Cache-Control')).toBe(
				'public, s-maxage=900, stale-while-revalidate=604800',
			);
		});

		it('should keep the browser copy fresh so revalidation happens only at the edge', async () => {
			environment.production = true;

			const response = await appUnderTest().request('/anything');

			expect(response.headers.get('Cache-Control')).toBe('public, max-age=0, must-revalidate');
		});

		// El id de quien produjo el miss se devolvería idéntico a todos los hits durante el TTL.
		it('should drop the request id from a cacheable response', async () => {
			environment.production = true;

			const response = await appUnderTest().request('/anything');

			expect(response.headers.get('x-request-id')).toBeNull();
		});

		it('should emit nothing outside production', async () => {
			environment.production = false;

			const response = await appUnderTest().request('/anything');

			expect(response.headers.get('Vercel-CDN-Cache-Control')).toBeNull();
			expect(response.headers.get('Cache-Control')).toBeNull();
			expect(response.headers.get('x-request-id')).toBe('the-first-request');
		});
	});

	describe('applyLandingPageCacheHeaders', () => {
		function landingAppUnderTest(): Hono {
			const app = new Hono();
			app.get('/landing-page', (c) => {
				c.header('x-request-id', 'the-first-request');
				return applyLandingPageCacheHeaders(c.json({ week: '2026-30' }));
			});
			app.get('/missing-week', (c) => applyLandingPageCacheHeaders(c.json({ error: 'not found' }, 404)));
			return app;
		}

		it('should emit the short revalidation window of the weekly rotation with the configured s-maxage', async () => {
			environment.production = true;
			environment.readCacheSMaxAge = 900;

			const response = await landingAppUnderTest().request('/landing-page');

			expect(response.headers.get('Vercel-CDN-Cache-Control')).toBe(
				'public, s-maxage=900, stale-while-revalidate=86400',
			);
			expect(response.headers.get('Cache-Control')).toBe('public, max-age=0, must-revalidate');
		});

		// El id de quien produjo el miss se devolvería idéntico a todos los hits durante el TTL.
		it('should drop the request id from a cacheable landing response', async () => {
			environment.production = true;

			const response = await landingAppUnderTest().request('/landing-page');

			expect(response.headers.get('x-request-id')).toBeNull();
		});

		// Una copia de error cacheada serviría el 404 como si fuera la semana vigente.
		it('should leave an error response without edge headers', async () => {
			environment.production = true;

			const response = await landingAppUnderTest().request('/missing-week');

			expect(response.headers.get('Vercel-CDN-Cache-Control')).toBeNull();
		});

		it('should emit nothing outside production', async () => {
			environment.production = false;

			const response = await landingAppUnderTest().request('/landing-page');

			expect(response.headers.get('Vercel-CDN-Cache-Control')).toBeNull();
			expect(response.headers.get('x-request-id')).toBe('the-first-request');
		});
	});
});
