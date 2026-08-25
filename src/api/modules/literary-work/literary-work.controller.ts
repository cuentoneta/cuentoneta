import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

import { slugSchema } from '@schemas/common.schemas';
import { LiteraryWorkNotFoundError } from './literary-work.errors';
import type { LiteraryWorkRepository } from './literary-work.repository';
import { getLiteraryWorkBySlug, getLiteraryWorksByAuthorSlug } from './literary-work.service';

export function createLiteraryWorkController(repository?: LiteraryWorkRepository) {
	const controller = new Hono();

	// Declarada antes de `/:slug`: si no, `author` matchearía como un slug de obra. Sin ramas de error
	// propias — un autor sin obras es un listado vacío, y la obra mal curada la descarta el service.
	controller.get('/author/:slug', zValidator('param', slugSchema), async (c) => {
		const { slug } = c.req.valid('param');
		const literaryWorks = await getLiteraryWorksByAuthorSlug(slug, repository);
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
