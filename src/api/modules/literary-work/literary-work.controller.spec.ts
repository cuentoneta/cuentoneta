import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import { onoffLiteraryWorkTeasersMock } from '@mocks/onoff-literary-work-teasers.mock';
import { onoffLiteraryWorkCatalogEntriesMock } from '@mocks/onoff-literary-work-catalog-entries.mock';
import { RESERVED_LITERARY_WORK_SLUGS } from '@models/reserved-literary-work-slugs.model';
import { Hono } from 'hono';
import { environment } from '../../_helpers/environment';
import { readCacheHeaders } from '@middleware/read-cache-headers.middleware';
import { createLiteraryWorkController } from './literary-work.controller';
import { LiteraryWorkNotFoundError } from './literary-work.errors';
import { InMemoryLiteraryWorkRepository } from './literary-work.repository.mock';

describe('literaryWorkController', () => {
	const controller = createLiteraryWorkController(
		new InMemoryLiteraryWorkRepository({
			literaryWorks: onoffLiteraryWorksMock,
			teasers: onoffLiteraryWorkTeasersMock,
			catalogEntries: onoffLiteraryWorkCatalogEntriesMock,
		}),
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
		type CatalogBody = { entries: Record<string, unknown>[]; total: number };

		it('should return the catalogue envelope with every entry and its total', async () => {
			const response = await controller.request('/');
			const body: CatalogBody = await response.json();

			expect(response.status).toBe(200);
			expect(body.entries).toHaveLength(onoffLiteraryWorkCatalogEntriesMock.length);
			expect(body.total).toBe(body.entries.length);
		});

		// Es el criterio "responde exactamente los campos del contrato", afirmado sobre el HTTP: el sobre, la
		// entrada (con su discriminante) y lo que transporta de cada autor y cada etiqueta.
		it('should respond exactly the keys of the contract at every level', async () => {
			const body: CatalogBody = await (await controller.request('/')).json();

			expect(Object.keys(body).sort()).toEqual(['entries', 'total']);
			body.entries.forEach((entry) => {
				expect(Object.keys(entry).sort()).toEqual(['authors', 'kind', 'slug', 'tags', 'title', 'totalReadingTime']);
				(entry['authors'] as object[]).forEach((author) =>
					expect(Object.keys(author).sort()).toEqual(['name', 'slug']),
				);
				(entry['tags'] as object[]).forEach((tag) => expect(Object.keys(tag).sort()).toEqual(['slug', 'title']));
			});
		});

		it('should serve the entries in the order of the repository, by slug', async () => {
			const body: CatalogBody = await (await controller.request('/')).json();

			expect(body.entries.map(({ slug }) => slug)).toEqual(onoffLiteraryWorkCatalogEntriesMock.map(({ slug }) => slug));
		});

		// El recurso no tiene filtros: un param que no declara se rechaza en vez de ignorarse, así quien pide un
		// filtro se entera. `limit` figura a propósito: hasta que la paginación lo declare, también es desconocido.
		it.each([`author=${knownAuthor.slug}`, 'author=sin-obras', 'limit=10', 'utm_source=x'])(
			'should reject the query %j with a 400',
			async (query) => {
				const response = await controller.request(`/?${query}`);

				expect(response.status).toBe(400);
			},
		);

		// Sin trailing slash, que es la URL que el frontend arma de verdad: si el patrón del middleware
		// no cubriera el path exacto del recurso colección, este caso lo delataría.
		it('should emit the edge cache headers on the catalogue in production', async () => {
			environment.production = true;
			environment.readCacheSMaxAge = 900;

			const response = await appUnderTest().request('/literary-work');

			expect(response.headers.get('Vercel-CDN-Cache-Control')).toBe(
				'public, s-maxage=900, stale-while-revalidate=604800',
			);
		});

		it('should not emit cache headers on the 400 of an unknown param', async () => {
			environment.production = true;

			const response = await appUnderTest().request(`/literary-work?author=${knownAuthor.slug}`);

			expect(response.status).toBe(400);
			expect(response.headers.get('Vercel-CDN-Cache-Control')).toBeNull();
		});
	});

	describe('GET /teasers', () => {
		// Si `/:slug` capturara `teasers`, la respuesta sería el 404 de una obra inexistente, y el perfil
		// del autor lo traduce en silencio a una lista vacía.
		it('should return the teasers of the author instead of resolving teasers as a slug', async () => {
			const response = await controller.request(`/teasers?author=${knownAuthor.slug}`);
			const body: { authors: { slug: string }[] }[] = await response.json();

			expect(response.status).toBe(200);
			expect(Array.isArray(body)).toBe(true);
			expect(body.length).toBeGreaterThan(0);
			body.forEach(({ authors }) => {
				expect(authors.some(({ slug }) => slug === knownAuthor.slug)).toBe(true);
			});
		});

		it('should return an empty list for an author without works', async () => {
			const response = await controller.request('/teasers?author=sin-obras');

			expect(response.status).toBe(200);
			expect(await response.json()).toEqual([]);
		});

		it('should reject a request without author with a 400', async () => {
			const response = await controller.request('/teasers');

			expect(response.status).toBe(400);
		});

		it.each(['no%20es%20un%20slug', knownAuthor.slug.toUpperCase()])(
			'should reject the author %j with a 400',
			async (author) => {
				const response = await controller.request(`/teasers?author=${author}`);

				expect(response.status).toBe(400);
			},
		);

		it('should emit the edge cache headers in production', async () => {
			environment.production = true;
			environment.readCacheSMaxAge = 900;

			const response = await appUnderTest().request(`/literary-work/teasers?author=${knownAuthor.slug}`);

			expect(response.headers.get('Vercel-CDN-Cache-Control')).toBe(
				'public, s-maxage=900, stale-while-revalidate=604800',
			);
		});
	});

	// Hono despacha en orden de registro. El caso de comportamiento cubre `/teasers`; estas aserciones
	// cubren además toda sub-ruta estática que se agregue: si se registra después de `/:slug` o no
	// reserva su segmento, rompen acá.
	describe('route table', () => {
		const registeredPaths = [...new Set(controller.routes.map(({ path }) => path))];
		const staticSubPaths = registeredPaths.filter((path) => path !== '/' && !path.includes(':'));

		it('should register every static sub-route before /:slug', () => {
			expect(staticSubPaths).toContain('/teasers');
			staticSubPaths.forEach((path) => {
				expect(registeredPaths.indexOf(path)).toBeLessThan(registeredPaths.indexOf('/:slug'));
			});
		});

		it('should reserve in the Studio the segment of every static sub-route', () => {
			const staticSegments = staticSubPaths.map((path) => path.split('/')[1]);

			expect(new Set(staticSegments)).toEqual(new Set(RESERVED_LITERARY_WORK_SLUGS));
		});
	});
});
