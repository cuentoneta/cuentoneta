import type { StorylistStoriesNavigationTeasersQueryResult } from '../../sanity/types';
import { onoffRawNavTeasersMock } from '../onoff-raw-stories.mock';

// Collection cruda Onoff — "El inventario de las pasiones" (el deseo de ordenar lo inordenable).
// Forma cruda de `storylistStoriesNavigationTeasersQuery`, para testear
// `fetchStorylistStoriesNavigationTeaserByStorylistSlug`.
// TODO(#1681): `featuredImage` queda en null (imagery 'sample') hasta contar con la ref de Sanity
// de `src/assets/img/mocks/collections/el-inventario-de-las-pasiones.png`; junto con `storyCoverImages`,
// se resuelve el tema imagery de los raws de una sola vez en el follow-up.
export const elInventarioDeLasPasionesRawNavCollection: NonNullable<StorylistStoriesNavigationTeasersQueryResult> = {
	_id: 'onoff-inventario-de-las-pasiones',
	slug: 'inventario-de-las-pasiones',
	title: 'El inventario de las pasiones',
	description: [],
	featuredImage: null,
	storyCoverImages: [],
	tags: [],
	stories: onoffRawNavTeasersMock,
	count: onoffRawNavTeasersMock.length,
	config: { showAuthors: true },
	tabs: [],
	mediaSources: [],
};
