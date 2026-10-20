import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

import { literaryWorkSuggestionsQuerySchema, literaryWorkTeaserFilterSchema } from '@schemas/literary-work.schemas';
import { slugParamValidator } from '@middleware/slug-param-validator.middleware';
import type { ReadingSuggestionsScope } from '@models/reading-suggestions.model';
import { LiteraryWorkNotFoundError } from './literary-work.errors';
import type { LiteraryWorkRepository } from './literary-work.repository';
import { getLiteraryWorkBySlug, getLiteraryWorkTeasers, getReadingSuggestions } from './literary-work.service';

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

	// Las sugerencias de lectura al pie de la obra, ya elegidas y recortadas: el cliente no recibe
	// candidatas que no vaya a mostrar ni decide cuáles son. El ámbito —autor o colección— es
	// excluyente y viaja como query param, igual que el filtro del catálogo.
	controller.get(
		'/:slug/suggestions',
		slugParamValidator((slug) => new LiteraryWorkNotFoundError(slug)),
		zValidator('query', literaryWorkSuggestionsQuerySchema),
		async (c) => {
			const { slug } = c.req.valid('param');
			const query = c.req.valid('query');
			const scope: ReadingSuggestionsScope =
				'author' in query ? { author: query.author } : { collection: query.collection };

			return c.json(await getReadingSuggestions(slug, scope, query.limit, repository));
		},
	);

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
