import * as z from 'zod/mini';
import { literaryWorkTeaserDtoSchema } from './literary-work.dto';

// El contrato de wire del bloque de sugerencias: el encabezado del ámbito más las obras ya elegidas
// por el backend, en la misma vista de teaser que el resto de los listados.
export const readingSuggestionsDtoSchema = z.object({
	title: z.string(),
	suggestions: z.array(literaryWorkTeaserDtoSchema),
});

export type ReadingSuggestionsDto = z.infer<typeof readingSuggestionsDtoSchema>;
