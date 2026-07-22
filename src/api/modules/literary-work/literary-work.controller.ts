import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { slugSchema } from '../../schemas/common.schemas';
import { literaryWorkQuerySchema } from './literary-work.schema';
import { getLiteraryWorkBySlug } from './literary-work.service';
import { LiteraryWorkNotFoundError, LiteraryWorkSectionNotFoundError } from './literary-work.errors';
import type { LiteraryWorkRepository } from './literary-work.repository';

// La factory (en vez del Hono suelto del resto de los módulos) existe para inyectar el
// repository doble en los tests de integración; el export default conserva el registro real.
export function createLiteraryWorkController(repository?: LiteraryWorkRepository) {
	const controller = new Hono();

	controller.get('/:slug', zValidator('param', slugSchema), zValidator('query', literaryWorkQuerySchema), async (c) => {
		const { slug } = c.req.valid('param');
		const { section } = c.req.valid('query');
		try {
			const result = await getLiteraryWorkBySlug(slug, section, repository);
			return c.json(result);
		} catch (error) {
			// Recurso inexistente responde 404 JSON propio (no el 500 del onError global) —
			// decisión asentada en docs/LITERARY_WORK_DESIGN.md §7. Todo otro error sigue subiendo.
			if (error instanceof LiteraryWorkNotFoundError || error instanceof LiteraryWorkSectionNotFoundError) {
				return c.json({ error: error.message }, 404);
			}
			throw error;
		}
	});

	return controller;
}

const literaryWorkController = createLiteraryWorkController();
export default literaryWorkController;
