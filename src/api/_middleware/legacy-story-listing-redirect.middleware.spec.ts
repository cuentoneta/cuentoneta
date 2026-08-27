import { Hono } from 'hono';
import { legacyStoryListingRedirect } from './legacy-story-listing-redirect.middleware';

describe('legacyStoryListingRedirect', () => {
	// `strict: false` es el modo de la instancia real, y es lo que hace que `/story/` entre por la
	// misma ruta que `/story`.
	function appUnderTest(): Hono {
		const app = new Hono({ strict: false });
		app.on('GET', '/story', legacyStoryListingRedirect);
		app.get('/story/:slug', (c) => c.text('detalle de la obra'));
		return app;
	}

	it('should answer the retired listing with a permanent redirect', async () => {
		const response = await appUnderTest().request('/story');

		expect(response.status).toBe(301);
		expect(response.headers.get('Location')).toBe('/literary-work');
	});

	it('should redirect the listing with a trailing slash too', async () => {
		const response = await appUnderTest().request('/story/');

		expect(response.status).toBe(301);
		expect(response.headers.get('Location')).toBe('/literary-work');
	});

	// El detalle de una obra tiene su propio traslado, en otro tren: si esta redirección se lo llevara
	// puesto, cada obra publicada dejaría de responder y el listado se comería su tráfico.
	it('should leave the detail of a work untouched', async () => {
		const response = await appUnderTest().request('/story/el-palacio-de-las-nueve-fronteras');

		expect(response.status).toBe(200);
		expect(await response.text()).toBe('detalle de la obra');
	});
});
