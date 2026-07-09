import type { StorylistStoriesNavigationTeasersQueryResult } from '../../sanity/types';
import { onoffRawNavTeasersMock } from '../onoff-raw-stories.mock';

// Collection cruda Onoff — "El inventario de las pasiones" (el deseo de ordenar lo inordenable).
// Forma cruda de `storylistStoriesNavigationTeasersQuery`, para testear
// `fetchStorylistStoriesNavigationTeaserByStorylistSlug`.
export const elInventarioDeLasPasionesRawNavCollection: NonNullable<StorylistStoriesNavigationTeasersQueryResult> = {
	_id: 'onoff-inventario-de-las-pasiones',
	slug: 'inventario-de-las-pasiones',
	title: 'El inventario de las pasiones',
	description: [],
	featuredImage: {
		_type: 'image',
		asset: { _type: 'reference', _ref: 'image-b02ff4ca997e7b8d5244cae72b704f59a4855fb1-236x328-png' },
	},
	storyCoverImages: onoffRawNavTeasersMock.slice(0, 3).map((story) => story.coverImage),
	tags: [],
	stories: onoffRawNavTeasersMock,
	count: onoffRawNavTeasersMock.length,
	config: { showAuthors: true },
	tabs: [],
	mediaSources: [],
};
