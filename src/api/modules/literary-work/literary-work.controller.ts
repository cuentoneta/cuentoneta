import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

import { literaryWorkCatalogQuerySchema, literaryWorkTeasersQuerySchema } from '@schemas/literary-work.schemas';
import { slugParamValidator } from '@middleware/slug-param-validator.middleware';
import { LiteraryWorkNotFoundError } from './literary-work.errors';
import type { LiteraryWorkRepository } from './literary-work.repository';
import { getLiteraryWorkBySlug, getLiteraryWorkCatalog, getLiteraryWorkTeasers } from './literary-work.service';

export function createLiteraryWorkController(repository?: LiteraryWorkRepository) {
	const controller = new Hono();

	// El recurso colección es el catálogo de obras, que consume la superficie `/literary-work`. No acepta
	// filtros: cualquier query param responde 400. Sin ramas de error propias: la obra mal formada la
	// excluye el service, y un catálogo sin entradas es un sobre vacío.
	controller.get('/', zValidator('query', literaryWorkCatalogQuerySchema), async (c) =>
		c.json(await getLiteraryWorkCatalog(repository)),
	);

	// Los avances de las obras de un autor, para el perfil del autor y las sugerencias de lectura (ver
	// el mapeo contexto → módulo en docs/DOMAIN_MODEL.md); un autor sin obras es `[]`. Hono despacha en
	// orden de registro y `teasers` es un slug bien formado, así que la ruta va antes que `/:slug`. Cada
	// sub-ruta reserva su segmento en `RESERVED_LITERARY_WORK_SLUGS`, que el Studio hace cumplir.
	controller.get('/teasers', zValidator('query', literaryWorkTeasersQuerySchema), async (c) => {
		const filter = c.req.valid('query');
		const teasers = await getLiteraryWorkTeasers(filter, repository);
		return c.json(teasers);
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
