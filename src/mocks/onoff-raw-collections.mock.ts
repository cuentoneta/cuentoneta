import type { StorylistQueryResult, StorylistStoriesNavigationTeasersQueryResult } from '@sanity-types';
import { geometriasDelDesveloRawCollection } from './onoff/geometrias-del-desvelo.collection.raw.mock';
import { elInventarioDeLasPasionesRawNavCollection } from './onoff/el-inventario-de-las-pasiones.collection.raw.mock';

// Colecciones crudas del corpus, en sus dos formas de query: la completa y la de teasers de
// navegación. Los specs toman de acá en vez de importar una colección puntual, para no atarse a la
// que exista hoy.
export const onoffRawCollectionsMock: NonNullable<StorylistQueryResult>[] = [geometriasDelDesveloRawCollection];

export const onoffRawNavCollectionsMock: NonNullable<StorylistStoriesNavigationTeasersQueryResult>[] = [
	elInventarioDeLasPasionesRawNavCollection,
];
