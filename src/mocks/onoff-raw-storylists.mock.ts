import type { StorylistQueryResult } from '@sanity-types';
import { geometriasDelDesveloRawStorylist } from './onoff/geometrias-del-desvelo.storylist.raw.mock';

// Storylists crudas del corpus. Los specs toman de acá en vez de importar una puntual, para no
// atarse a la que exista hoy.
export const onoffRawStorylistsMock: NonNullable<StorylistQueryResult>[] = [geometriasDelDesveloRawStorylist];
