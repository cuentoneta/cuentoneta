import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import { onoffLiteraryWorkTeasersMock } from '@mocks/onoff-literary-work-teasers.mock';
import { Hono } from 'hono';
import { environment } from '../../_helpers/environment';
import { readCacheHeaders } from '../../_middleware/read-cache-headers.middleware';
import { createLiteraryWorkController } from './literary-work.controller';
import { LiteraryWorkNotFoundError } from './literary-work.errors';
import { InMemoryLiteraryWorkRepository } from './literary-work.repository.mock';

describe('literaryWorkController', () => {
	const controller = createLiteraryWorkController(
		new InMemoryLiteraryWorkRepository(onoffLiteraryWorksMock, onoffLiteraryWorkTeasersMock),
	);
	const knownSlug = onoffLiteraryWorksMock[0].slug;
	const [knownAuthor] = onoffLiteraryWorkTeasersMock[0].authors;
	const originalProduction = environment.production;
	const originalSMaxAge = environment.readCacheSMaxAge;

	afterEach(() => {
		environment.production = originalProduction;
		environment.readCacheSMaxAge = originalSMaxAge;
	});

	// Espeja el montaje real de `routes.ts`: los headers de caché no los emite el controller sino el
	// middleware de la ruta, así que la composición es lo que hay que ejercitar.
	function appUnderTest(): Hono {
		const app = new Hono();
		app.on('GET', '/literary-work/*', readCacheHeaders);
		app.route('/literary-work', controller);
		return app;
	}

	it.each(onoffLiteraryWorksMock)(
		'should return the full literary work with a 200 for "$slug"',
		async (literaryWork) => {
			const response = await controller.request(`/${literaryWork.slug}`);
			const body = await response.json();

			expect(response.status).toBe(200);
			expect(body.slug).toBe(literaryWork.slug);
		},
	);

	it('should respond 404 with an error envelope for an unknown slug', async () => {
		const response = await controller.request('/no-existe');
		const body = await response.json();

		expect(response.status).toBe(404);
		expect(body.error).toContain('no-existe');
	});

	it('should answer a slug the schema rejects with the same 404 as an unknown one', async () => {
		const response = await controller.request('/no%20es%20slug');

		expect(response.status).toBe(404);
		await expect(response.json()).resolves.toEqual({ error: new LiteraryWorkNotFoundError('no es slug').message });
	});

	// Slugs que `createSlug` rechaza: si la frontera los dejara pasar, el throw del dominio saldría como 500.
	it.each(['IcyFox', knownSlug.toUpperCase(), 'el--aleph', '-lead'])(
		'should answer the slug %j, which the domain rejects, with a 404',
		async (slug) => {
			const response = await controller.request(`/${slug}`);

			expect(response.status).toBe(404);
			await expect(response.json()).resolves.toEqual({ error: new LiteraryWorkNotFoundError(slug).message });
		},
	);

	it('should not emit cache headers on the 404 of a malformed slug', async () => {
		environment.production = true;

		const response = await appUnderTest().request('/literary-work/no%20es%20slug');

		expect(response.status).toBe(404);
		expect(response.headers.get('Vercel-CDN-Cache-Control')).toBeNull();
	});

	it('should emit the edge cache headers on a 200 in production', async () => {
		environment.production = true;
		environment.readCacheSMaxAge = 900;

		const response = await appUnderTest().request(`/literary-work/${knownSlug}`);

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toBe(
			'public, s-maxage=900, stale-while-revalidate=604800',
		);
		expect(response.headers.get('Cache-Control')).toBe('public, max-age=0, must-revalidate');
	});

	it('should not emit cache headers outside production', async () => {
		environment.production = false;

		const response = await appUnderTest().request(`/literary-work/${knownSlug}`);

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toBeNull();
	});

	it('should not emit cache headers on a 404', async () => {
		environment.production = true;

		const response = await appUnderTest().request('/literary-work/no-existe');

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toBeNull();
	});

	describe('GET /', () => {
		it('should return the whole catalog as teasers when no filter is given', async () => {
			const response = await controller.request('/');
			const body = await response.json();

			expect(response.status).toBe(200);
			expect(Array.isArray(body)).toBe(true);
			expect(body).toHaveLength(onoffLiteraryWorkTeasersMock.length);
		});

		it('should return only the works of the author given in the filter', async () => {
			const response = await controller.request(`/?author=${knownAuthor.slug}`);
			const body: { authors: { slug: string }[] }[] = await response.json();

			expect(response.status).toBe(200);
			expect(body.length).toBeGreaterThan(0);
			body.forEach(({ authors }) => {
				expect(authors.some(({ slug }) => slug === knownAuthor.slug)).toBe(true);
			});
		});

		// Un filtro sin resultados no es un error: la ausencia legítima es un listado vacío, y este
		// caso es lo que impide que alguien lo convierta después en un 404.
		it('should return an empty listing for an author without works', async () => {
			const response = await controller.request('/?author=sin-obras');

			expect(response.status).toBe(200);
			expect(await response.json()).toEqual([]);
		});

		// El filtro es un criterio sobre el listado, no un recurso: un valor mal formado es un request
		// inválido, y por eso sigue en 400 aunque el slug de ruta responda 404.
		it.each(['no%20es%20un%20slug', knownAuthor.slug.toUpperCase()])(
			'should reject the filter value %j with a 400',
			async (author) => {
				const response = await controller.request(`/?author=${author}`);

				expect(response.status).toBe(400);
			},
		);

		// Sin trailing slash, que es la URL que el frontend arma de verdad: si el patrón del middleware
		// no cubriera el path exacto del listado, este caso lo delataría.
		it('should emit the edge cache headers on the listing in production', async () => {
			environment.production = true;
			environment.readCacheSMaxAge = 900;

			const response = await appUnderTest().request(`/literary-work?author=${knownAuthor.slug}`);

			expect(response.headers.get('Vercel-CDN-Cache-Control')).toBe(
				'public, s-maxage=900, stale-while-revalidate=604800',
			);
		});
	});
});
