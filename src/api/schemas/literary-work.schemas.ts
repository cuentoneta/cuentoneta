import { z } from 'zod';
import { READING_SUGGESTIONS_COUNT } from '@models/reading-suggestions.model';
import { slugValueSchema } from './common.schemas';

// El filtrado del catálogo va por query params, no por sub-rutas: cada criterio nuevo es un campo
// opcional acá, y el alfabeto del valor reusa el del slug de path — es la misma clase de identificador.
export const literaryWorkTeaserFilterSchema = z.object({
	author: slugValueSchema.optional(),
});

// Un entero de query en su forma decimal: solo dígitos, sin signo, exponente ni espacios. Los límites
// y el default los pone esta ruta.
const suggestionsLimitSchema = z
	.string()
	.regex(/^\d+$/, 'limit must be a decimal integer')
	.transform(Number)
	.pipe(z.number().int().min(1).max(10))
	// `.default()` devolvería el valor tal cual, sin pasar por la transformación, y el handler recibiría
	// el string: por eso el default se aplica después del parseo.
	.optional()
	.transform((value) => value ?? READING_SUGGESTIONS_COUNT);

// El ámbito es excluyente —o el autor o la colección—, así que son dos ramas estrictas y no dos campos
// opcionales que puedan llegar juntos: con los dos, la query no dice de dónde sugerir.
export const literaryWorkSuggestionsQuerySchema = z.union([
	z.strictObject({ author: slugValueSchema, limit: suggestionsLimitSchema }),
	z.strictObject({ collection: slugValueSchema, limit: suggestionsLimitSchema }),
]);
