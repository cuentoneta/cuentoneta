import type { Media } from '@models/media.model';
import type { StoryTeaserWithAuthor } from '@models/story.model';
import { onoffStoryTeasersMock } from './onoff-story-teasers.mock';

// Conjunto de medios variado para ilustrar los selectores de multimedia y el contador
const richMedia: Media[] = [
	{ title: 'Video 1', type: 'youTubeVideo', description: [], data: { videoId: 'a' } },
	{ title: 'Video 2', type: 'youTubeVideo', description: [], data: { videoId: 'b' } },
	{ title: 'Video 3', type: 'youTubeVideo', description: [], data: { videoId: 'c' } },
	{
		title: 'Space',
		type: 'spaceRecording',
		description: [],
		data: { url: null, duration: '', hostName: '', date: '' },
	},
	{ title: 'Podcast', type: 'spotifyPodcastEpisode', description: [], data: { url: 'https://spotify.com' } },
];

export const withRichMedia = (teaser: StoryTeaserWithAuthor): StoryTeaserWithAuthor => ({
	...teaser,
	media: richMedia,
});

// Obras del corpus (con multimedia) y sus portadas; comparten el índice del corpus.
export const corpusStories = onoffStoryTeasersMock.map(withRichMedia);
export const corpusCovers = onoffStoryTeasersMock.map((teaser) => teaser.coverImage);

const corpusLabels = Object.fromEntries(onoffStoryTeasersMock.map((teaser, index) => [index, teaser.title]));

// argType reutilizable del selector "Obra". Key-agnóstico: el consumidor lo asigna a su propia key (`storyIndex`, `coverIndex`, …) y agrega su `description`.
export const literaryWorkSelectArgType = {
	name: 'Obra',
	control: { type: 'select' as const, labels: corpusLabels },
	options: corpusStories.map((_, index) => index),
	table: { type: { summary: 'number' } },
};
