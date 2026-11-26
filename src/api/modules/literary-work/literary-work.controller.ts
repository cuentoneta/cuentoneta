import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

import { literaryWorkTeaserFilterSchema } from '@schemas/literary-work.schemas';
import { slugParamValidator } from '@middleware/slug-param-validator.middleware';
import { LiteraryWorkNotFoundError } from './literary-work.errors';
import type { LiteraryWorkRepository } from './literary-work.repository';
import { getLiteraryWorkBySlug, getLiteraryWorkListing } from './literary-work.service';

export function createLiteraryWorkController(repository?: LiteraryWorkRepository) {
	const controller = new Hono();

	// Los avances de obra, filtrables por query params. Sin filtro y con `author` sirven hoy a
	// superficies de contextos distintos (ver el mapeo contexto → módulo en docs/DOMAIN_MODEL.md).
	// Un criterio nuevo es un campo más del schema, no una sub-ruta. Sin ramas de error propias: un
	// filtro sin resultados es una lista vacía, y la obra mal formada la descarta el service.
	controller.get('/', zValidator('query', literaryWorkTeaserFilterSchema), async (c) => {
		const filter = c.req.valid('query');
		const literaryWorks = await getLiteraryWorkListing(filter, repository);
		return c.json(literaryWorks);
	});

	controller.get(
		'/:slug',
		slugParamValidator((slug) => new LiteraryWorkNotFoundError(slug)),
		async (c) => {
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
		},
	);

	return controller;
}

const literaryWorkController = createLiteraryWorkController();
export default literaryWorkController;
