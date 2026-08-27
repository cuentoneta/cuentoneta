import type { StoriesByAuthorSlugQueryResult, StoryBySlugQueryResult, StorylistQueryResult } from '@sanity-types';
import { rawOnoffAuthorTeaser } from './onoff-raw-author.mock';
import { elOdioRawStory } from './onoff/story/el-odio.story.raw.mock';
import { elPalacioRawStory } from './onoff/story/el-palacio-de-las-nueve-fronteras.story.raw.mock';
import { elTratadoRawStory } from './onoff/story/el-tratado-de-los-placeres.story.raw.mock';
import { geometriaRawStory } from './onoff/story/geometria.story.raw.mock';
import { lasDosAntorchasRawStory } from './onoff/story/las-dos-antorchas.story.raw.mock';
import { lasEscalerasRawStory } from './onoff/story/las-escaleras.story.raw.mock';
import { losPeldanosRawStory } from './onoff/story/los-peldanos.story.raw.mock';
import { neronRawStory } from './onoff/story/neron.story.raw.mock';

export const onoffRawStoriesMock: NonNullable<StoryBySlugQueryResult>[] = [
	elPalacioRawStory,
	geometriaRawStory,
	losPeldanosRawStory,
	lasEscalerasRawStory,
	elOdioRawStory,
	elTratadoRawStory,
	lasDosAntorchasRawStory,
	neronRawStory,
];

// La proyección de teaser no resuelve `audioUrl` (solo lo hace la de la obra completa): si el
// derivador lo copiara, el fixture sería más rico que la query real y taparía esa diferencia.
function withoutAudioUrl(
	mediaSources: NonNullable<StoryBySlugQueryResult>['mediaSources'],
): StoriesByAuthorSlugQueryResult[0]['mediaSources'] {
	return mediaSources.map((mediaSource) => {
		if (mediaSource._type !== 'spaceRecording') {
			return mediaSource;
		}
		const withoutResolvedUrl: Omit<typeof mediaSource, 'audioUrl'> & { audioUrl?: string | null } = {
			...mediaSource,
		};
		delete withoutResolvedUrl.audioUrl;
		return withoutResolvedUrl;
	});
}

function toRawTeaser(raw: NonNullable<StoryBySlugQueryResult>): StoriesByAuthorSlugQueryResult[0] {
	return {
		_id: raw._id,
		slug: raw.slug,
		title: raw.title,
		badLanguage: raw.badLanguage,
		body: raw.body.slice(0, 3),
		originalPublication: raw.originalPublication,
		approximateReadingTime: raw.approximateReadingTime,
		coverImage: raw.coverImage,
		mediaSources: withoutAudioUrl(raw.mediaSources),
		resources: raw.resources,
	};
}

function toRawNavTeaser(raw: NonNullable<StoryBySlugQueryResult>): NonNullable<StorylistQueryResult>['stories'][0] {
	return {
		_id: raw._id,
		slug: raw.slug,
		title: raw.title,
		badLanguage: raw.badLanguage,
		body: [],
		originalPublication: raw.originalPublication,
		approximateReadingTime: raw.approximateReadingTime,
		coverImage: raw.coverImage,
		resources: [],
		mediaSources: withoutAudioUrl(raw.mediaSources),
		author: rawOnoffAuthorTeaser,
	};
}

export const elPalacioRawTeaser = toRawTeaser(elPalacioRawStory);
export const geometriaRawTeaser = toRawTeaser(geometriaRawStory);
export const losPeldanosRawTeaser = toRawTeaser(losPeldanosRawStory);
export const lasEscalerasRawTeaser = toRawTeaser(lasEscalerasRawStory);
export const elOdioRawTeaser = toRawTeaser(elOdioRawStory);
export const elTratadoRawTeaser = toRawTeaser(elTratadoRawStory);
export const lasDosAntorchasRawTeaser = toRawTeaser(lasDosAntorchasRawStory);
export const neronRawTeaser = toRawTeaser(neronRawStory);

export const onoffRawTeasersMock: StoriesByAuthorSlugQueryResult = [
	elPalacioRawTeaser,
	geometriaRawTeaser,
	losPeldanosRawTeaser,
	lasEscalerasRawTeaser,
	elOdioRawTeaser,
	elTratadoRawTeaser,
	lasDosAntorchasRawTeaser,
	neronRawTeaser,
];

export const onoffRawNavTeasersMock: NonNullable<StorylistQueryResult>['stories'] = [
	toRawNavTeaser(elPalacioRawStory),
	toRawNavTeaser(geometriaRawStory),
	toRawNavTeaser(losPeldanosRawStory),
	toRawNavTeaser(lasEscalerasRawStory),
	toRawNavTeaser(elOdioRawStory),
	toRawNavTeaser(elTratadoRawStory),
	toRawNavTeaser(lasDosAntorchasRawStory),
	toRawNavTeaser(neronRawStory),
];

// Selectores por capacidad: un spec declara que necesita una story cruda con multimedia en vez de
// conocer qué obra la tiene. Derivados por predicado, así que enriquecer otra obra los actualiza solo.
export const onoffRawStoriesWithMediaSources: NonNullable<StoryBySlugQueryResult>[] = onoffRawStoriesMock.filter(
	(rawStory) => rawStory.mediaSources.length > 0,
);

export const onoffRawTeasersWithMediaSources: StoriesByAuthorSlugQueryResult = onoffRawTeasersMock.filter(
	(rawTeaser) => rawTeaser.mediaSources.length > 0,
);
