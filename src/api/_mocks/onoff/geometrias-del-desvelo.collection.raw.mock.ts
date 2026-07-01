import type { StorylistQueryResult } from '../../sanity/types';
import { onoffRawNavTeasersMock } from '../onoff-raw-stories.mock';

// Collection cruda Onoff — "Geometrías del desvelo" (obsesión por el orden y el tiempo).
// Forma cruda de `storylistQuery` (StorylistQueryResult), para testear `fetchStorylistBySlug`.
// TODO(#1681): `featuredImage` queda en null (imagery 'sample') hasta contar con la ref de Sanity
// de `src/assets/img/mocks/collections/geometrias-del-desvelo.png`; junto con `storyCoverImages`,
// se resuelve el tema imagery de los raws de una sola vez en el follow-up.
export const geometriasDelDesveloRawCollection: NonNullable<StorylistQueryResult> = {
	_id: 'onoff-geometrias-del-desvelo',
	slug: 'geometrias-del-desvelo',
	title: 'Geometrías del desvelo',
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
