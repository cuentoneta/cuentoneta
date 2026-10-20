import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import { onoffLiteraryWorkTeasersMock } from '@mocks/onoff-literary-work-teasers.mock';
import { onoffCollectionsMock } from '@mocks/onoff-collections.mock';
import { Hono } from 'hono';
import { environment } from '../../_helpers/environment';
import { readCacheHeaders } from '@middleware/read-cache-headers.middleware';
import { createLiteraryWorkController } from './literary-work.controller';
import { LiteraryWorkNotFoundError } from './literary-work.errors';
import { InMemoryLiteraryWorkRepository } from './literary-work.repository.mock';

describe('literaryWorkController', () => {
	const controller = createLiteraryWorkController(
		new InMemoryLiteraryWorkRepository(onoffLiteraryWorksMock, onoffLiteraryWorkTeasersMock, onoffCollectionsMock),
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

	describe('GET /:slug/suggestions', () => {
		const [knownCollection] = onoffCollectionsMock;
		const [collectionWork] = knownCollection.literaryWorks;
		const [knownTeaser] = onoffLiteraryWorkTeasersMock;

		async function suggestionsOf(workSlug: string, scope: string): Promise<Response> {
			return controller.request(`/${workSlug}/suggestions?${scope}`);
		}

		it('should serve the works of the author, headed by the author name, without the work being read', async () => {
			const response = await suggestionsOf(knownTeaser.slug, `author=${knownAuthor.slug}`);
			const body = (await response.json()) as { title: string; suggestions: { slug: string }[] };

			expect(response.status).toBe(200);
			expect(body.title).toBe(knownAuthor.name);
			expect(body.suggestions).toHaveLength(3);
			expect(body.suggestions.map(({ slug }) => slug)).not.toContain(knownTeaser.slug);
		});

		it('should serve the works of the collection, headed by its title', async () => {
			const response = await suggestionsOf(collectionWork.slug, `collection=${knownCollection.slug}`);
			const body = (await response.json()) as { title: string; suggestions: { slug: string }[] };

			expect(response.status).toBe(200);
			expect(body.title).toBe(knownCollection.title);
			expect(body.suggestions.length).toBeGreaterThan(0);
			expect(body.suggestions.map(({ slug }) => slug)).not.toContain(collectionWork.slug);
		});

		it('should honour the limit query param', async () => {
			const response = await suggestionsOf(knownTeaser.slug, `author=${knownAuthor.slug}&limit=1`);
			const body = (await response.json()) as { suggestions: { slug: string }[] };

			expect(body.suggestions).toHaveLength(1);
		});

		// Un ámbito sin obras no es un error: el bloque no se pinta, y esto es lo que impide que alguien
		// lo convierta después en un 404.
		it.each(['author=sin-obras', 'collection=sin-obras'])(
			'should serve an empty block for the scope %j',
			async (scope) => {
				const response = await suggestionsOf(knownTeaser.slug, scope);

				expect(response.status).toBe(200);
				await expect(response.json()).resolves.toEqual({ title: '', suggestions: [] });
			},
		);

		// El otro extremo del rango: el límite se acepta hasta 10, y el 11 es el que se rechaza.
		it('should accept the upper limit', async () => {
			const response = await suggestionsOf(collectionWork.slug, `collection=${knownCollection.slug}&limit=10`);
			const body = (await response.json()) as { suggestions: { slug: string }[] };

			expect(response.status).toBe(200);
			expect(body.suggestions.length).toBeLessThanOrEqual(10);
		});

		// El ámbito es excluyente: sin él no hay de dónde sugerir, y con los dos el pedido se contradice.
		it.each(['', 'author=', 'limit=3', `author=${knownAuthor.slug}&collection=${knownCollection.slug}`])(
			'should reject the query %j with a 400',
			async (query) => {
				const response = await suggestionsOf(knownTeaser.slug, query);

				expect(response.status).toBe(400);
			},
		);

		it.each(['0', '11', 'abc', '1.5', '0x2', '1e1'])('should reject the limit value %j with a 400', async (limit) => {
			const response = await suggestionsOf(knownTeaser.slug, `author=${knownAuthor.slug}&limit=${limit}`);

			expect(response.status).toBe(400);
		});

		// El ámbito es un criterio de filtro, no un recurso: un valor mal formado es un request inválido,
		// y por eso responde 400 aunque el slug de ruta responda 404.
		it('should reject a malformed scope slug with a 400', async () => {
			const response = await suggestionsOf(knownTeaser.slug, 'author=no%20es%20slug');

			expect(response.status).toBe(400);
		});

		it('should answer a path slug the schema rejects with the 404 of the work', async () => {
			const response = await controller.request('/no%20es%20slug/suggestions?author=un-autor');

			expect(response.status).toBe(404);
			await expect(response.json()).resolves.toEqual({ error: new LiteraryWorkNotFoundError('no es slug').message });
		});

		it('should emit the edge cache headers on the block in production', async () => {
			environment.production = true;
			environment.readCacheSMaxAge = 900;

			const response = await appUnderTest().request(
				`/literary-work/${knownTeaser.slug}/suggestions?author=${knownAuthor.slug}`,
			);

			expect(response.headers.get('Vercel-CDN-Cache-Control')).toBe(
				'public, s-maxage=900, stale-while-revalidate=604800',
			);
		});
	});
});
