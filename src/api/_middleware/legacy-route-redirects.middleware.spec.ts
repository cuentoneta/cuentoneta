import { Hono } from 'hono';
import {
	legacyHomeRedirect,
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
		app.on('GET', '/home', legacyHomeRedirect);
		app.on('GET', '/story', legacyStoryListingRedirect);
		app.on('GET', '/story/:slug', legacyStoryDetailRedirect);
		app.on('GET', '/storylist', legacyStorylistListingRedirect);
		app.on('GET', '/storylist/:slug', legacyStorylistDetailRedirect);
		return app;
	}

	it.each([
		['/home', '/'],
		['/home/', '/'],
		['/home?utm_source=boletin&page=2', '/?utm_source=boletin&page=2'],
	])('should answer the retired home %s with a permanent redirect to the root', async (path, destination) => {
		const response = await appUnderTest().request(path);

		expect(response.status).toBe(301);
		expect(response.headers.get('Location')).toBe(destination);
	});

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
		['/story/el-palacio-de-las-nueve-fronteras', '/literary-work/el-palacio-de-las-nueve-fronteras'],
		['/storylist/verano-2022', '/collection/verano-2022'],
	])('should carry the slug of %s over to its new section', async (path, destination) => {
		const response = await appUnderTest().request(path);

		expect(response.status).toBe(301);
		expect(response.headers.get('Location')).toBe(destination);
	});

	it('should redirect a detail with a trailing slash to its destination without one', async () => {
		const response = await appUnderTest().request('/story/el-fin/');

		expect(response.status).toBe(301);
		expect(response.headers.get('Location')).toBe('/literary-work/el-fin');
	});

	// El slug llega decodificado desde el router: sin volver a codificarlo, un carácter reservado
	// produciría un destino con más segmentos de los pedidos.
	it('should re-encode a slug that carries a reserved character', async () => {
		const response = await appUnderTest().request('/story/a%2Fb');

		expect(response.headers.get('Location')).toBe('/literary-work/a%2Fb');
	});

	// El traslado es del prefijo de ruta, no una sustitución de texto: un slug que contiene el nombre
	// de la sección vieja sale intacto.
	it('should leave a slug that contains the old section name alone', async () => {
		const response = await appUnderTest().request('/story/historia-de-story');

		expect(response.headers.get('Location')).toBe('/literary-work/historia-de-story');
	});

	// Los parámetros de campaña vienen en la query string: perderlos en el traslado rompe la atribución
	// de cada enlace ya publicado hacia afuera.
	it('should carry the query string over', async () => {
		const response = await appUnderTest().request('/story/el-fin?utm_source=boletin&page=2');

		expect(response.headers.get('Location')).toBe('/literary-work/el-fin?utm_source=boletin&page=2');
	});

	// El detalle captura cualquier segmento bajo el prefijo, no solo un slug. Hoy no hay nada más ahí, y
	// este caso es lo que lo deja afirmado antes de que alguien agregue algo.
	it('should redirect any segment under the retired prefix, not only a slug', async () => {
		const response = await appUnderTest().request('/story/index.html');

		expect(response.status).toBe(301);
		expect(response.headers.get('Location')).toBe('/literary-work/index.html');
	});

	// El slug viejo de una obra puede ser el vigente de otra: el destino de cada eslabón es su propia obra.
	it.each([
		['/story/un-dia-perfecto-para-el-pez-platano', '/literary-work/la-pelota'],
		['/story/un-dia-perfecto-para-el-pez-banana', '/literary-work/un-dia-perfecto-para-el-pez-platano'],
		['/story/IcyFox?utm_source=boletin', '/literary-work/que-seria-yo-sin-ti?utm_source=boletin'],
	])('should redirect the renamed %s to the current slug of the same work', async (path, destination) => {
		const response = await appUnderTest().request(path);

		expect(response.status).toBe(301);
		expect(response.headers.get('Location')).toBe(destination);
	});

	// La tabla de renombres es solo de obras: un slug de colección homónimo se traslada tal cual.
	it('should not apply the literary work renames to a collection', async () => {
		const response = await appUnderTest().request('/storylist/IcyFox');

		expect(response.headers.get('Location')).toBe('/collection/IcyFox');
	});

	// Un nombre que el prototipo de un objeto ya trae no es un slug renombrado.
	it('should carry over a slug that names an inherited object property', async () => {
		const response = await appUnderTest().request('/story/constructor');

		expect(response.headers.get('Location')).toBe('/literary-work/constructor');
	});
});
