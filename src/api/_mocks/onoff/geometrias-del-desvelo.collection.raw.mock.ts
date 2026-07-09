import type { StorylistQueryResult } from '../../sanity/types';
import { onoffRawNavTeasersMock } from '../onoff-raw-stories.mock';

// Collection cruda Onoff — "Geometrías del desvelo" (obsesión por el orden y el tiempo).
// Forma cruda de `storylistQuery` (StorylistQueryResult), para testear `fetchStorylistBySlug`.
export const geometriasDelDesveloRawCollection: NonNullable<StorylistQueryResult> = {
	_id: 'onoff-geometrias-del-desvelo',
	slug: 'geometrias-del-desvelo',
	title: 'Geometrías del desvelo',
	description: [],
	featuredImage: {
		_type: 'image',
		asset: { _type: 'reference', _ref: 'image-6efd3e53eec8dfab23e1c0109027be9f58a01f8c-236x328-png' },
	},
	storyCoverImages: onoffRawNavTeasersMock.slice(0, 3).map((story) => story.coverImage),
	tags: [],
	stories: onoffRawNavTeasersMock,
	count: onoffRawNavTeasersMock.length,
	config: { showAuthors: true },
	tabs: [],
	mediaSources: [],
};
