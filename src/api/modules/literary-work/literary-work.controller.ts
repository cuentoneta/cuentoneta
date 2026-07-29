import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

import { slugSchema } from '@schemas/common.schemas';
import { LiteraryWorkNotFoundError } from './literary-work.errors';
import { getLiteraryWorkBySlug } from './literary-work.service';

const literaryWorkController = new Hono();

literaryWorkController.get('/:slug', zValidator('param', slugSchema), async (c) => {
	const { slug } = c.req.valid('param');

	try {
		const literaryWork = await getLiteraryWorkBySlug(slug);
		return c.json(literaryWork);
	} catch (error) {
		// Un slug inexistente es 404, no el 500 al que el onError global degrada cualquier throw.
		if (error instanceof LiteraryWorkNotFoundError) {
			return c.json({ error: error.message }, 404);
		}
		throw error;
	}
});

export default literaryWorkController;
