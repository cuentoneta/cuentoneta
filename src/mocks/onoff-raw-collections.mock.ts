import type { StorylistQueryResult } from '@sanity-types';
import { geometriasDelDesveloRawCollection } from './onoff/geometrias-del-desvelo.collection.raw.mock';

// Colecciones crudas del corpus. Los specs toman de acá en vez de importar una colección puntual,
// para no atarse a la que exista hoy.
export const onoffRawCollectionsMock: NonNullable<StorylistQueryResult>[] = [geometriasDelDesveloRawCollection];
