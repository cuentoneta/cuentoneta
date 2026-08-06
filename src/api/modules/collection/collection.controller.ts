import { Hono, type Context } from 'hono';
import { zValidator } from '@hono/zod-validator';

import { slugSchema } from '@schemas/common.schemas';
import { CollectionNotFoundError, MalformedCollectionError } from './collection.errors';
import type { CollectionRepository } from './collection.repository';
import { getCollectionBySlug, getCollections } from './collection.service';

// Traduce los dos errores tipados del módulo a respuestas distintas, porque son problemas distintos:
// el slug inexistente es del pedido y la colección mal curada es del catálogo. Cualquier otro error
// se relanza al `onError` global, que lo degrada a 500.
//
// El mensaje del error de curaduría nombra la colección culpable, que es un dato de diagnóstico del
// servidor —en los listados ni siquiera es la que el cliente pidió—, así que la respuesta lleva un
// código estable en vez del mensaje.
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

	// El listado va en la raíz, como en author, story y contributor. Que devuelva la vista reducida es
	// lo normal en un listado, y evita un segmento que competiría con el espacio de slugs.
	controller.get('/', async (c) => respond(c, () => getCollections(repository)));

	controller.get('/:slug', zValidator('param', slugSchema), async (c) => {
		const { slug } = c.req.valid('param');
		return respond(c, () => getCollectionBySlug(slug, repository));
	});

	return controller;
}

const collectionController = createCollectionController();
export default collectionController;
