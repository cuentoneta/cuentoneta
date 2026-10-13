import { Hono } from 'hono';
import { restoreAllMocks, spyOn } from '@test-utils';
import { environment } from '../_helpers/environment';
import {
	legacyDetailRedirect,
	legacyStoryListingRedirect,
	legacyStorylistListingRedirect,
} from './legacy-route-redirects.middleware';

type ResolveSlug = (legacySlug: string) => Promise<string>;

const keepSlug: ResolveSlug = (slug) => Promise.resolve(slug);

describe('legacy route redirects', () => {
	// `strict: false` es el modo de la instancia real, y es lo que hace que `/story/` entre por la
	// misma ruta que `/story`. El orden de registro también es el real: el listado antes que el
	// detalle, que es lo que decide adónde cae la barra final.
	//
	// El resolutor entra por parámetro: por defecto conserva el slug, que es el traslado de todo documento
	// cuyo slug no cambió al migrar.
	function appUnderTest(resolveSlug: ResolveSlug = keepSlug): Hono {
		const app = new Hono({ strict: false });
		app.on('GET', '/story', legacyStoryListingRedirect);
		app.on('GET', '/story/:slug', legacyDetailRedirect('/literary-work', resolveSlug));
		app.on('GET', '/storylist', legacyStorylistListingRedirect);
		app.on('GET', '/storylist/:slug', legacyDetailRedirect('/collection', resolveSlug));
		return app;
	}

	const originalProduction = environment.production;

	afterEach(() => {
		environment.production = originalProduction;
		restoreAllMocks();
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

	// El slug viejo de una obra puede ser el vigente de otra: el destino es el que resuelve la procedencia,
	// no el slug pedido.
	it('should redirect to the slug the provenance resolves to', async () => {
		const resolveSlug: ResolveSlug = (slug) => Promise.resolve(slug === 'pez-banana' ? 'pez-platano' : slug);

		const response = await appUnderTest(resolveSlug).request('/story/pez-banana?utm_source=boletin');

		expect(response.status).toBe(301);
		expect(response.headers.get('Location')).toBe('/literary-work/pez-platano?utm_source=boletin');
	});

	// Un slug viejo puede no cumplir la regla vigente: el que trae mayúsculas tiene que llegar al resolutor
	// tal como vino, porque es así como lo guarda su documento de origen.
	it('should hand the legacy slug to the resolver untouched', async () => {
		const requested: string[] = [];
		const resolveSlug: ResolveSlug = (slug) => {
			requested.push(slug);
			return Promise.resolve('que-seria-yo-sin-ti');
		};

		const response = await appUnderTest(resolveSlug).request('/story/IcyFox');

		expect(requested).toEqual(['IcyFox']);
		expect(response.headers.get('Location')).toBe('/literary-work/que-seria-yo-sin-ti');
	});

	it('should re-encode a resolved slug that carries a reserved character', async () => {
		const response = await appUnderTest(() => Promise.resolve('a/b')).request('/story/el-fin');

		expect(response.headers.get('Location')).toBe('/literary-work/a%2Fb');
	});

	it('should cache a resolved redirect at the CDN in production', async () => {
		environment.production = true;

		const response = await appUnderTest().request('/storylist/verano-2022');

		expect(response.status).toBe(301);
		expect(response.headers.get('Vercel-CDN-Cache-Control')).toContain('s-maxage=');
	});

	it('should not cache a redirect outside production', async () => {
		environment.production = false;

		const response = await appUnderTest().request('/storylist/verano-2022');

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toBeNull();
	});

	// Un destino cacheado durante una caída de Sanity se seguiría sirviendo después de que vuelva.
	it('should fall back to the legacy slug, uncached, when the resolver fails', async () => {
		environment.production = true;
		const consoleError = spyOn(console, 'error').mockImplementation(() => undefined);

		const response = await appUnderTest(() => Promise.reject(new Error('Sanity no responde'))).request(
			'/story/el-fin?page=2',
		);

		expect(response.status).toBe(301);
		expect(response.headers.get('Location')).toBe('/literary-work/el-fin?page=2');
		expect(response.headers.get('Vercel-CDN-Cache-Control')).toBeNull();
		expect(consoleError).toHaveBeenCalled();
	});
});
