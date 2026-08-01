import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

import { slugSchema } from '@schemas/common.schemas';
import { applyReadCacheHeaders } from '../../_helpers/cache-control';
import { LiteraryWorkNotFoundError } from './literary-work.errors';
import type { LiteraryWorkRepository } from './literary-work.repository';
import { getLiteraryWorkBySlug } from './literary-work.service';

export function createLiteraryWorkController(repository?: LiteraryWorkRepository) {
	const controller = new Hono();

	controller.get('/:slug', zValidator('param', slugSchema), async (c) => {
		const { slug } = c.req.valid('param');

		try {
			const literaryWork = await getLiteraryWorkBySlug(slug, repository);
			// Misma caché de borde que la página SSR de /read (el JSON es determinístico, sin riesgo
			// de fallback CSR): solo el 200 la recibe, y el 404 sale del catch sin pasar por acá.
			applyReadCacheHeaders(c);
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
