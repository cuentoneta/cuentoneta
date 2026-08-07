import { Hono, type Context } from 'hono';
import { zValidator } from '@hono/zod-validator';

import { slugSchema } from '@schemas/common.schemas';
import { CollectionNotFoundError, MalformedCollectionError } from './collection.errors';
import type { CollectionRepository } from './collection.repository';
import { getCollectionBySlug, getCollections } from './collection.service';

// El error de curaduría responde con un código y no con su mensaje, a diferencia del de arriba: ese
// mensaje nombra la colección culpable, que en un listado ni siquiera es la que el cliente pidió.
async function respond<T>(c: Context, produce: () => Promise<T>) {
	try {
		return c.json(await produce());
	} catch (error) {
		if (error instanceof CollectionNotFoundError) {
			return c.json({ error: error.message }, 404);
		}
		if (error instanceof MalformedCollectionError) {
			return c.json({ error: 'collection_malformed' }, 500);
		}
		throw error;
	}
}

export function createCollectionController(repository?: CollectionRepository) {
	const controller = new Hono();

	controller.get('/', async (c) => respond(c, () => getCollections(repository)));

	controller.get('/:slug', zValidator('param', slugSchema), async (c) => {
		const { slug } = c.req.valid('param');
		return respond(c, () => getCollectionBySlug(slug, repository));
	});

	return controller;
}

const collectionController = createCollectionController();
export default collectionController;
