import { z } from 'zod';
import { slugSchema } from './common.schemas';

// El filtrado del catálogo va por query params, no por sub-rutas: cada criterio nuevo es un campo
// opcional acá, y el alfabeto del valor reusa el del slug de path — es la misma clase de identificador.
export const literaryWorkTeaserFilterSchema = z.object({
	author: slugSchema.shape.slug.optional(),
});
