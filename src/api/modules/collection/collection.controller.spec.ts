import { onoffCollectionsMock } from '@mocks/onoff-collections.mock';
import { Hono } from 'hono';
import { createCollectionController } from './collection.controller';
import { MalformedCollectionError } from './collection.errors';
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

	it('serves the full listing with every collection', async () => {
		const response = await app.request('/collection');
		const body = (await response.json()) as unknown[];

		expect(response.status).toBe(200);
		expect(body).toHaveLength(onoffCollectionsMock.length);
	});

	// El listado completo existe justamente para llevar las obras: sin eso no se distingue del teaser.
	it('carries the works in the full listing', async () => {
		const response = await app.request('/collection');
		const [collection] = (await response.json()) as { literaryWorks: unknown[] }[];

		expect(collection?.literaryWorks.length).toBeGreaterThan(0);
	});

	it('serves teasers that carry no works', async () => {
		const response = await app.request('/collection/teasers');
		const body = (await response.json()) as { literaryWorks: unknown[]; count: number }[];

		expect(response.status).toBe(200);
		body.forEach((teaser) => {
			expect(teaser.literaryWorks).toEqual([]);
			expect(teaser.count).toBeGreaterThan(0);
		});
	});

	// Si `/:slug` se resolviera primero, esta ruta se leería como una colección de slug "teasers".
	it('resolves teasers as a listing and not as a slug', async () => {
		const response = await app.request('/collection/teasers');

		expect(Array.isArray(await response.json())).toBe(true);
	});

	it('answers 404 for a slug no collection carries', async () => {
		const response = await app.request('/collection/inexistente');

		expect(response.status).toBe(404);
	});

	it('answers 400 for a slug the schema rejects', async () => {
		const response = await app.request('/collection/Con Espacios');

		expect(response.status).toBe(400);
	});
});

describe('collectionController with malformed data', () => {
	// El repository levanta este error cuando la colección existe pero no se puede construir.
	class FailingCollectionRepository implements CollectionRepository {
		public async fetchBySlug(): Promise<never> {
			throw new MalformedCollectionError('geometrias-del-desvelo');
		}
		public async fetchAll(): Promise<never> {
			throw new MalformedCollectionError('geometrias-del-desvelo');
		}
		public async fetchTeasers(): Promise<never> {
			throw new MalformedCollectionError('geometrias-del-desvelo');
		}
	}

	const failing = appWith(new FailingCollectionRepository());

	// No es 404: la colección existe, lo que falla es su curaduría.
	it.each(['/collection/geometrias-del-desvelo', '/collection', '/collection/teasers'])(
		'answers 500 with a stable code for %s',
		async (path) => {
			const response = await failing.request(path);

			expect(response.status).toBe(500);
			await expect(response.json()).resolves.toEqual({ error: 'collection_malformed' });
		},
	);

	// El mensaje nombra la colección culpable, que en un listado ni siquiera es la que se pidió.
	it('keeps the offending slug out of the response', async () => {
		const response = await failing.request('/collection');

		await expect(response.text()).resolves.not.toContain('geometrias-del-desvelo');
	});
});
