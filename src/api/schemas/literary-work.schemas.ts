import { z } from 'zod';
import { slugValueSchema } from './common.schemas';

// Query params del recurso colección, que sirve el catálogo de obras. Se declara aunque esté vacío porque
// es el lugar donde la paginación suma `limit` y `offset` como campos. Es estricto: un param que el
// recurso no tiene responde 400 en vez de ignorarse, así quien pide un filtro se entera, y el 400 no se
// cachea en el borde.
export const literaryWorkCatalogQuerySchema = z.strictObject({});

// El filtrado de los avances va por query params, no por sub-rutas: un criterio nuevo es un campo
// más acá. El alfabeto del valor reusa el del slug de path, porque es la misma clase de identificador.
// `author` es obligatorio porque ningún consumidor pide los avances sin acotar: sin filtro, el
// endpoint serviría la colección entera.
export const literaryWorkTeasersQuerySchema = z.object({
	author: slugValueSchema,
});
