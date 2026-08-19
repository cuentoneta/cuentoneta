import {
	isAudioRecording,
	isSpaceRecording,
	isSpotifyPodcastEpisode,
	isYouTubeVideo,
	type Media,
	type MediaTeaser,
} from './media.model';
import {
	onoffAudioRecordingsMock,
	onoffSpaceRecordingsMock,
	onoffSpotifyPodcastEpisodesMock,
	onoffYouTubeVideosMock,
} from '@mocks/onoff-media.mock';

const guards = [
	{ name: 'isAudioRecording', guard: isAudioRecording, own: onoffAudioRecordingsMock[0] },
	{ name: 'isSpaceRecording', guard: isSpaceRecording, own: onoffSpaceRecordingsMock[0] },
	{ name: 'isYouTubeVideo', guard: isYouTubeVideo, own: onoffYouTubeVideosMock[0] },
	{ name: 'isSpotifyPodcastEpisode', guard: isSpotifyPodcastEpisode, own: onoffSpotifyPodcastEpisodesMock[0] },
];

const everyMedia: Media[] = guards.map((entry) => entry.own);

describe('type guards de Media', () => {
	it.each(guards)('$name reconoce su propio tipo', ({ guard, own }) => {
		expect(guard(own)).toBe(true);
	});

	it.each(guards)('$name rechaza los demás tipos', ({ guard, own }) => {
		const others = everyMedia.filter((media) => media !== own);

		expect(others.map((media) => guard(media))).toEqual([false, false, false]);
	});
});

// La asimetría entre las dos vistas la evalúa el gate `typecheck`, que cubre los *.spec.ts: si
// alguna de estas dos afirmaciones dejara de ser verdad, el gate corta acá y no en la página.
describe('asignabilidad entre la vista de teaser y la completa', () => {
	it('no admite un teaser donde se espera la vista completa', () => {
		const teaser: MediaTeaser = { type: 'audioRecording' };

		// @ts-expect-error un MediaTeaser no trae `data`, así que montar un widget desde un listado no compila
		const asMedia: Media = teaser;

		expect(asMedia.type).toBe('audioRecording');
	});

	it('admite la vista completa donde se espera un teaser', () => {
		const media: Media = onoffAudioRecordingsMock[0];
		const asTeaser: MediaTeaser = media;

		expect(asTeaser.type).toBe(media.type);
	});
});
