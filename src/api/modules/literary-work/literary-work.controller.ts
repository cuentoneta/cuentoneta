import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

import { slugSchema } from '@schemas/common.schemas';
import { literaryWorkTeaserFilterSchema } from '@schemas/literary-work.schemas';
import { LiteraryWorkNotFoundError } from './literary-work.errors';
import type { LiteraryWorkRepository } from './literary-work.repository';
import type { ContentRepository } from '../content/content.repository';
import { getLiteraryWorkBySlug, getLiteraryWorkTeasers, updateMostReadLiteraryWorks } from './literary-work.service';

// El repository de contenido entra por separado porque no lo usa ninguna lectura de obras: es de quien
// escribe el ranking, que vive acá por ser una operación sobre obras.
export function createLiteraryWorkController(
	repository?: LiteraryWorkRepository,
	contentRepository?: ContentRepository,
) {
	const controller = new Hono();

	// El catálogo, filtrable por query params: un criterio nuevo es un campo más del schema, no una
	// sub-ruta por atributo. Sin ramas de error propias — un filtro sin resultados es un listado
	// vacío, y la obra mal curada la descarta el service.
	controller.get('/', zValidator('query', literaryWorkTeaserFilterSchema), async (c) => {
		const filter = c.req.valid('query');
		const literaryWorks = await getLiteraryWorkTeasers(filter, repository);
		return c.json(literaryWorks);
	});

	// Va antes del comodín de slug, que si no se la come tratando "update-most-read" como una obra.
	//
	// El `no-store` no es decorativo: el módulo sirve sus lecturas con caché de borde, y sin declararse
	// incacheable esta escritura recibiría el mismo tratamiento y la corrida siguiente se resolvería
	// con un hit, devolviendo un 200 sin haber actualizado nada.
	controller.get('/update-most-read', async (c) => {
		const result = await updateMostReadLiteraryWorks(contentRepository);
		c.header('Cache-Control', 'no-store');
		return c.json(result);
	});

	controller.get('/:slug', zValidator('param', slugSchema), async (c) => {
		const { slug } = c.req.valid('param');

		try {
			const literaryWork = await getLiteraryWorkBySlug(slug, repository);
			return c.json(literaryWork);
		} catch (error) {
			// Un slug inexistente es 404, no el 500 al que el onError global degrada cualquier throw.
			if (error instanceof LiteraryWorkNotFoundError) {
				return c.json({ error: error.message }, 404);
			}
			throw error;
		}
	});

	return controller;
}

const literaryWorkController = createLiteraryWorkController();
export default literaryWorkController;
