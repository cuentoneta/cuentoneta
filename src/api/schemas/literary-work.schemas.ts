import { z } from 'zod';
import { LiteraryWorkListingView } from '@models/literary-work.model';
import { slugValueSchema } from './common.schemas';

// El filtrado del listado va por query params, no por sub-rutas: cada criterio nuevo es un campo
// opcional acá, y el alfabeto del valor reusa el del slug de path — es la misma clase de identificador.
//
// `view` elige la proyección. El default es el catálogo, la vista angosta: el SSR descarta toda respuesta
// de la API de más de 1 MiB, así que quien pida el listado sin pensar en su peso tiene que recibir la
// barata. La vista de tarjeta, con extracto, se pide de forma explícita.
export const literaryWorkListingQuerySchema = z.object({
	author: slugValueSchema.optional(),
	view: z
		.enum([LiteraryWorkListingView.Catalog, LiteraryWorkListingView.Teaser])
		.default(LiteraryWorkListingView.Catalog),
});
