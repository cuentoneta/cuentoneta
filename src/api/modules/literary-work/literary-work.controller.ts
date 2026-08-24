import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

import { slugSchema } from '@schemas/common.schemas';
import { LiteraryWorkNotFoundError, MalformedLiteraryWorkError } from './literary-work.errors';
import type { LiteraryWorkRepository } from './literary-work.repository';
import { getLiteraryWorkBySlug, getLiteraryWorksByAuthorSlug } from './literary-work.service';

// Rutas específicas antes del comodín /:slug: el orden de registro es el que Hono usa para resolver.
export function createLiteraryWorkController(repository?: LiteraryWorkRepository) {
	const controller = new Hono();

	controller.get('/author/:slug', zValidator('param', slugSchema), async (c) => {
		const { slug } = c.req.valid('param');

		try {
			return c.json(await getLiteraryWorksByAuthorSlug(slug, repository));
		} catch (error) {
			// El mensaje del error nombra la obra culpable: el envelope estable dice qué falló sin
			// filtrar ese dato.
			if (error instanceof MalformedLiteraryWorkError) {
				return c.json({ error: 'literary_work_malformed' }, 500);
			}
			throw error;
		}
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
