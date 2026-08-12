import { onoffImageAssets } from '../../onoff-image-assets.mock';
import type { StorylistQueryResult } from '@sanity-types';
import { onoffRawNavTeasersMock } from '../../onoff-raw-stories.mock';

// Storylist cruda Onoff — "Geometrías del desvelo" (obsesión por el orden y el tiempo).
// Forma cruda de `storylistQuery` (StorylistQueryResult), para testear `fetchStorylistBySlug`.
export const geometriasDelDesveloRawStorylist: NonNullable<StorylistQueryResult> = {
	_id: 'onoff-geometrias-del-desvelo',
	slug: 'geometrias-del-desvelo',
	title: 'Geometrías del desvelo',
	description: [],
	featuredImage: {
		_type: 'image',
		asset: { _type: 'reference', _ref: onoffImageAssets.geometriasDelDesveloCover.ref },
	},
	storyCoverImages: onoffRawNavTeasersMock.slice(0, 3).map((story) => story.coverImage),
	tags: [],
	stories: onoffRawNavTeasersMock,
	count: onoffRawNavTeasersMock.length,
	config: { showAuthors: true },
	tabs: [],
	mediaSources: [],
};
