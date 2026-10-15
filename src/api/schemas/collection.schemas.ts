import { z } from 'zod';
import { decimalIntegerQueryParamSchema } from './common.schemas';

// El default y el techo son parte del contrato de la ruta: sin `limit` devuelve tres sugerencias, y
// pedir más de diez sería pedir el catálogo.
export const collectionSuggestionsQuerySchema = z.object({
	// El default se aplica después del parseo porque `.default()` devuelve el valor tal cual, sin pasar
	// por la transformación, y el handler recibiría el string.
	limit: decimalIntegerQueryParamSchema
		.pipe(z.number().int().min(1).max(10))
		.optional()
		.transform((value) => value ?? 3),
});
