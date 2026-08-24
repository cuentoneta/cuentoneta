import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import { Hono } from 'hono';
import { environment } from '../../_helpers/environment';
import { readCacheHeaders } from '../../_middleware/read-cache-headers.middleware';
import { createLiteraryWorkController } from './literary-work.controller';
import { MalformedLiteraryWorkError } from './literary-work.errors';
import { InMemoryLiteraryWorkRepository } from './literary-work.repository.mock';

describe('literaryWorkController', () => {
	const controller = createLiteraryWorkController(new InMemoryLiteraryWorkRepository(onoffLiteraryWorksMock));
	const knownSlug = onoffLiteraryWorksMock[0].slug;
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

	// El orden de registro es el que resuelve: si el comodín /:slug ganara, esta ruta respondería con
	// la obra "author" inexistente en vez del listado.
	describe('GET /author/:slug', () => {
		it('serves the author works as teasers with a 200', async () => {
			const response = await controller.request(`/author/${onoffLiteraryWorksMock[0].authors[0].slug}`);
			const body = (await response.json()) as { slug: string; excerpt: { bodyHtml: string } }[];

			expect(response.status).toBe(200);
			expect(body).toHaveLength(onoffLiteraryWorksMock.length);
			for (const teaser of body) {
				expect(teaser.excerpt.bodyHtml).toContain('<p>');
			}
		});

		it('serves an empty listing for an author without works', async () => {
			const response = await controller.request('/author/sin-obras');

			expect(response.status).toBe(200);
			await expect(response.json()).resolves.toEqual([]);
		});

		it('answers 400 for a slug the schema rejects', async () => {
			const response = await controller.request('/author/Con Espacios');

			expect(response.status).toBe(400);
		});
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

	it('should emit the same edge cache headers on the author listing', async () => {
		environment.production = true;
		environment.readCacheSMaxAge = 900;

		const response = await appUnderTest().request(`/literary-work/author/${onoffLiteraryWorksMock[0].authors[0].slug}`);

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toContain('s-maxage=900');
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
});

describe('literaryWorkController with malformed data', () => {
	class MalformedAuthorListingRepository extends InMemoryLiteraryWorkRepository {
		public async fetchByAuthorSlug(): Promise<never> {
			throw new MalformedLiteraryWorkError('el-odio');
		}
	}

	const app = new Hono();
	app.route(
		'/literary-work',
		createLiteraryWorkController(new MalformedAuthorListingRepository(onoffLiteraryWorksMock)),
	);

	// La obra existe: lo que falla es su curaduría, no el pedido.
	it('answers 500 with a stable code for the author listing', async () => {
		const response = await app.request('/literary-work/author/francois-onoff');

		expect(response.status).toBe(500);
		await expect(response.json()).resolves.toEqual({ error: 'literary_work_malformed' });
	});

	it('keeps the offending slug out of the response', async () => {
		const response = await app.request('/literary-work/author/francois-onoff');

		await expect(response.text()).resolves.not.toContain('el-odio');
	});
});
