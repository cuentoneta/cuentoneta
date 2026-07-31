import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

import { slugSchema } from '@schemas/common.schemas';
import { readCacheControl } from '../../_helpers/cache-control';
import { environment } from '../../_helpers/environment';
import { LiteraryWorkNotFoundError } from './literary-work.errors';
import type { LiteraryWorkRepository } from './literary-work.repository';
import { getLiteraryWorkBySlug } from './literary-work.service';

export function createLiteraryWorkController(repository?: LiteraryWorkRepository) {
	const controller = new Hono();

	controller.get('/:slug', zValidator('param', slugSchema), async (c) => {
		const { slug } = c.req.valid('param');

		try {
			const literaryWork = await getLiteraryWorkBySlug(slug, repository);
			// Misma caché de borde que la página SSR de `/read` (el JSON es determinístico, sin
			// riesgo de fallback CSR): header inline solo en el 200 y solo en producción.
			if (environment.production) {
				c.header('Cache-Control', readCacheControl());
			}
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
