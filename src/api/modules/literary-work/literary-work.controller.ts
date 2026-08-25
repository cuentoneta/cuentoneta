import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

import { slugSchema } from '@schemas/common.schemas';
import { literaryWorkTeaserFilterSchema } from '@schemas/literary-work.schemas';
import { LiteraryWorkNotFoundError } from './literary-work.errors';
import type { LiteraryWorkRepository } from './literary-work.repository';
import { getLiteraryWorkBySlug, getLiteraryWorkTeasers } from './literary-work.service';

export function createLiteraryWorkController(repository?: LiteraryWorkRepository) {
	const controller = new Hono();

	// El catálogo, filtrable por query params: un criterio nuevo es un campo más del schema, no una
	// sub-ruta por atributo. Sin ramas de error propias — un filtro sin resultados es un listado
	// vacío, y la obra mal curada la descarta el service.
	controller.get('/', zValidator('query', literaryWorkTeaserFilterSchema), async (c) => {
		const filter = c.req.valid('query');
		const literaryWorks = await getLiteraryWorkTeasers(filter, repository);
		return c.json(literaryWorks);
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
