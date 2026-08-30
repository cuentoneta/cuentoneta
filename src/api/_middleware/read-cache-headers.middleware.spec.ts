import { Hono } from 'hono';

import { environment } from '../_helpers/environment';
import { readCacheHeaders } from './read-cache-headers.middleware';

describe('readCacheHeaders', () => {
	const originalProduction = environment.production;

	afterEach(() => {
		environment.production = originalProduction;
	});

	function appUnderTest(): Hono {
		const app = new Hono();
		app.on('GET', ['/obra', '/obra/*'], readCacheHeaders);
		app.get('/obra', (c) => c.json([]));
		app.get('/obra/inexistente', (c) => c.json({ message: 'no existe' }, 404));
		app.get('/obra/escritura', (c) => {
			c.header('Cache-Control', 'no-store');
			return c.json({ done: true });
		});
		app.get('/obra/:slug', (c) => c.json({ slug: c.req.param('slug') }));
		return app;
	}

	it('emite el TTL de borde en una lectura exitosa', async () => {
		environment.production = true;

		const response = await appUnderTest().request('/obra/la-obra');

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toContain(`s-maxage=${environment.readCacheSMaxAge}`);
		expect(response.headers.get('Vercel-CDN-Cache-Control')).toContain('stale-while-revalidate=');
		// El browser revalida siempre: el TTL vive solo en el CDN, que es donde se revalida una vez.
		expect(response.headers.get('Cache-Control')).toBe('public, max-age=0, must-revalidate');
	});

	// El catálogo cuelga del mismo prefijo pero no tiene segmento propio, y el comodín de Hono exige al
	// menos uno: registrarlo aparte es lo que evita que la ruta más pedida quede sin caché.
	it('alcanza también al catálogo, sin segmento debajo del recurso', async () => {
		environment.production = true;

		const response = await appUnderTest().request('/obra');

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toContain('s-maxage=');
	});

	it('no cachea una respuesta que no sea 200', async () => {
		environment.production = true;

		const response = await appUnderTest().request('/obra/inexistente');

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toBeNull();
	});

	// Una escritura servida desde la caché devolvería un 200 sin haber corrido.
	it('respeta el `no-store` que el handler ya declaró', async () => {
		environment.production = true;

		const response = await appUnderTest().request('/obra/escritura');

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toBeNull();
		expect(response.headers.get('Cache-Control')).toBe('no-store');
	});

	// Un preview comparte el CDN y serviría contenido de un dataset que no es el público.
	it('no cachea fuera de producción', async () => {
		environment.production = false;

		const response = await appUnderTest().request('/obra/la-obra');

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toBeNull();
	});
});
