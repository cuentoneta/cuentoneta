import { onoffCollectionsMock } from '@mocks/onoff-collections.mock';
import { Hono } from 'hono';
import { createCollectionController } from './collection.controller';
import { CollectionNotFoundError, MalformedCollectionError } from './collection.errors';
import { InMemoryCollectionRepository } from './collection.repository.mock';
import type { CollectionRepository } from './collection.repository';

const [firstCollection] = onoffCollectionsMock;

function appWith(repository: CollectionRepository): Hono {
	const app = new Hono();
	app.route('/collection', createCollectionController(repository));
	return app;
}

const app = appWith(new InMemoryCollectionRepository(onoffCollectionsMock));

describe('collectionController', () => {
	it('serves a collection by slug', async () => {
		const response = await app.request(`/collection/${firstCollection?.slug}`);

		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toMatchObject({ slug: firstCollection?.slug });
	});

	it('serves the listing as teasers', async () => {
		const response = await app.request('/collection');
		const body = (await response.json()) as { literaryWorks: unknown[]; count: number }[];

		expect(response.status).toBe(200);
		expect(body).toHaveLength(onoffCollectionsMock.length);
		body.forEach((teaser) => {
			expect(teaser.literaryWorks).toEqual([]);
			expect(teaser.count).toBeGreaterThan(0);
		});
	});

	it('answers 404 for a slug no collection carries', async () => {
		const response = await app.request('/collection/inexistente');

		expect(response.status).toBe(404);
	});

	it('answers the uppercase twin of an existing slug, which the domain rejects, with a 404', async () => {
		const response = await app.request(`/collection/${firstCollection?.slug.toUpperCase()}`);

		expect(response.status).toBe(404);
	});

	it('answers a slug the schema rejects with the same 404 as an unknown one', async () => {
		const response = await app.request('/collection/Con%20Espacios');

		expect(response.status).toBe(404);
		await expect(response.json()).resolves.toEqual({ error: new CollectionNotFoundError('Con Espacios').message });
	});
});

describe('collectionController suggestions', () => {
	it('serves the suggestions for a slug as teasers, leaving that collection out', async () => {
		const response = await app.request(`/collection/${firstCollection?.slug}/suggested`);
		const body = (await response.json()) as { slug: string; count: number; literaryWorks: unknown[] }[];

		expect(response.status).toBe(200);
		expect(body).toHaveLength(3);
		expect(body.map(({ slug }) => slug)).not.toContain(firstCollection?.slug);
		body.forEach((teaser) => {
			expect(teaser.literaryWorks).toEqual([]);
			expect(teaser.count).toBeGreaterThan(0);
		});
	});

	it('honours the limit query param', async () => {
		const response = await app.request(`/collection/${firstCollection?.slug}/suggested?limit=1`);
		const body = (await response.json()) as { slug: string }[];

		expect(body).toHaveLength(1);
	});

	it('accepts the top of the range, ten', async () => {
		const response = await app.request(`/collection/${firstCollection?.slug}/suggested?limit=10`);
		const body = (await response.json()) as unknown[];

		expect(response.status).toBe(200);
		expect(body.length).toBeGreaterThan(3);
		expect(body.length).toBeLessThanOrEqual(10);
	});

	it('serves an empty list when the catalog has no other collection', async () => {
		const singleCollection = appWith(new InMemoryCollectionRepository(onoffCollectionsMock.slice(0, 1)));
		const response = await singleCollection.request(`/collection/${firstCollection?.slug}/suggested`);

		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual([]);
	});

	// El recorte se valida antes del handler: pedir cero sugerencias o más de las que la ruta promete
	// es un pedido que no se puede satisfacer, no una lista vacía. El alfabeto es el decimal de
	// `common.schemas.ts`, así que la coerción nativa de JS no cuenta: `0x2` y `1e1` no son valores.
	it.each(['0', '11', 'abc', '1.5', '0x2', '1e1', '%203%20'])(
		'rejects the limit value %j with a 400',
		async (limit) => {
			const response = await app.request(`/collection/${firstCollection?.slug}/suggested?limit=${limit}`);

			expect(response.status).toBe(400);
		},
	);

	it('answers 404 for a slug no collection carries', async () => {
		const response = await app.request('/collection/inexistente/suggested');

		expect(response.status).toBe(404);
	});

	it('answers a slug the schema rejects with the same 404 as an unknown one', async () => {
		const response = await app.request('/collection/Con%20Espacios/suggested');

		expect(response.status).toBe(404);
		await expect(response.json()).resolves.toEqual({ error: new CollectionNotFoundError('Con Espacios').message });
	});
});

describe('collectionController with malformed data', () => {
	class FailingCollectionRepository implements CollectionRepository {
		public async fetchBySlug(): Promise<never> {
			throw new MalformedCollectionError('geometrias-del-desvelo');
		}
		public async fetchAll(): Promise<never> {
			throw new MalformedCollectionError('geometrias-del-desvelo');
		}
	}

	const failing = appWith(new FailingCollectionRepository());

	// La colección existe: lo que falla es su curaduría, no el pedido.
	it.each(['/collection/geometrias-del-desvelo', '/collection', '/collection/geometrias-del-desvelo/suggested'])(
		'answers 500 with a stable code for %s',
		async (path) => {
			const response = await failing.request(path);

			expect(response.status).toBe(500);
			await expect(response.json()).resolves.toEqual({ error: 'collection_malformed' });
		},
	);

	it('keeps the offending slug out of the response', async () => {
		const response = await failing.request('/collection');

		await expect(response.text()).resolves.not.toContain('geometrias-del-desvelo');
	});
});
