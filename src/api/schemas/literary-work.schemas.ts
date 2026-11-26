import { z } from 'zod';
import { slugValueSchema } from './common.schemas';

// Query params del recurso colección mientras sirva avances: acepta `author` hasta que sirva el
// catálogo. Los avances por autor validan con `literaryWorkTeasersQuerySchema`.
export const literaryWorkTeaserFilterSchema = z.object({
	author: slugValueSchema.optional(),
});

// El filtrado de los avances va por query params, no por sub-rutas: un criterio nuevo es un campo
// más acá. El alfabeto del valor reusa el del slug de path, porque es la misma clase de identificador.
// `author` es obligatorio porque ningún consumidor pide los avances sin acotar: sin filtro, el
// endpoint serviría la colección entera.
export const literaryWorkTeasersQuerySchema = z.object({
	author: slugValueSchema,
});
