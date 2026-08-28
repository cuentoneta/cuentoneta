import { Hono } from 'hono';
import {
	legacyStoryDetailRedirect,
	legacyStoryListingRedirect,
	legacyStorylistDetailRedirect,
	legacyStorylistListingRedirect,
} from './legacy-route-redirects.middleware';

describe('legacy route redirects', () => {
	// `strict: false` es el modo de la instancia real, y es lo que hace que `/story/` entre por la
	// misma ruta que `/story`. El orden de registro también es el real: el listado antes que el
	// detalle, que es lo que decide adónde cae la barra final.
	function appUnderTest(): Hono {
		const app = new Hono({ strict: false });
		app.on('GET', '/story', legacyStoryListingRedirect);
		app.on('GET', '/story/:slug', legacyStoryDetailRedirect);
		app.on('GET', '/storylist', legacyStorylistListingRedirect);
		app.on('GET', '/storylist/:slug', legacyStorylistDetailRedirect);
		return app;
	}

	it.each([
		['/story', '/literary-work'],
		['/story/', '/literary-work'],
		['/storylist', '/collection'],
		['/storylist/', '/collection'],
	])('should answer the retired listing %s with a permanent redirect', async (path, destination) => {
		const response = await appUnderTest().request(path);

		expect(response.status).toBe(301);
		expect(response.headers.get('Location')).toBe(destination);
	});

	it.each([
		['/story/el-palacio-de-las-nueve-fronteras', '/read/el-palacio-de-las-nueve-fronteras'],
		['/storylist/verano-2022', '/collection/verano-2022'],
	])('should carry the slug of %s over to its new section', async (path, destination) => {
		const response = await appUnderTest().request(path);

		expect(response.status).toBe(301);
		expect(response.headers.get('Location')).toBe(destination);
	});

	it('should redirect a detail with a trailing slash to its destination without one', async () => {
		const response = await appUnderTest().request('/story/el-fin/');

		expect(response.status).toBe(301);
		expect(response.headers.get('Location')).toBe('/read/el-fin');
	});

	// El slug llega decodificado desde el router: sin volver a codificarlo, un carácter reservado
	// produciría un destino con más segmentos de los pedidos.
	it('should re-encode a slug that carries a reserved character', async () => {
		const response = await appUnderTest().request('/story/a%2Fb');

		expect(response.headers.get('Location')).toBe('/read/a%2Fb');
	});

	// El traslado es del prefijo de ruta, no una sustitución de texto: un slug que contiene el nombre
	// de la sección vieja sale intacto.
	it('should leave a slug that contains the old section name alone', async () => {
		const response = await appUnderTest().request('/story/historia-de-story');

		expect(response.headers.get('Location')).toBe('/read/historia-de-story');
	});
});
