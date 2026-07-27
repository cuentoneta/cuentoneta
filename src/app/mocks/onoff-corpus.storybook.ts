import type { Media } from '@models/media.model';
import type { LiteraryWorkTeaser } from '@models/literary-work.model';
import { onoffLiteraryWorkTeasersMock } from './onoff-literary-work-teasers.mock';

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

export const withRichMediaSources = (teaser: LiteraryWorkTeaser): LiteraryWorkTeaser => ({
	...teaser,
	mediaSources: richMedia,
});

// Obras del corpus (con multimedia) y sus portadas; comparten el índice del corpus.
export const corpusLiteraryWorkTeasers = onoffLiteraryWorkTeasersMock.map(withRichMediaSources);
export const corpusCovers = onoffLiteraryWorkTeasersMock.map((teaser) => teaser.coverImage);

const corpusLabels = Object.fromEntries(onoffLiteraryWorkTeasersMock.map((teaser, index) => [index, teaser.title]));

// argType reutilizable del selector "Obra". Key-agnóstico: el consumidor lo asigna a su propia key (`literaryWorkIndex`, `coverIndex`, …) y agrega su `description`.
export const literaryWorkSelectArgType = {
	name: 'Obra',
	control: { type: 'select' as const, labels: corpusLabels },
	options: corpusLiteraryWorkTeasers.map((_, index) => index),
	table: { type: { summary: 'number' } },
};
