import {
	isAudioRecording,
	isSpaceRecording,
	isSpotifyPodcastEpisode,
	isYouTubeVideo,
	narrowMedia,
	type Media,
} from './media.model';
import { audioRecordingMock } from '@mocks/audio-recording.mock';
import { spaceRecordingMock } from '@mocks/space-recording.mock';
import { spotifyPodcastEpisodeMock } from '@mocks/spotify-podcast-episode.mock';
import { youtubeVideoMock } from '@mocks/youtube-video.mock';

const guards = [
	{ name: 'isAudioRecording', guard: isAudioRecording, own: audioRecordingMock },
	{ name: 'isSpaceRecording', guard: isSpaceRecording, own: spaceRecordingMock },
	{ name: 'isYouTubeVideo', guard: isYouTubeVideo, own: youtubeVideoMock },
	{ name: 'isSpotifyPodcastEpisode', guard: isSpotifyPodcastEpisode, own: spotifyPodcastEpisodeMock },
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

describe('narrowMedia', () => {
	it.each(everyMedia)('devuelve el mismo valor de "$type", ya angostado', (media) => {
		expect(narrowMedia(media)).toBe(media);
	});

	// El dominio solo modela los tipos que tienen widget: un tag fuera de MediaTypeKey significa que el
	// ACL del backend quedó desalineado con el modelo, y eso debe romper acá y no pintar un hueco.
	it('lanza ante un tipo que el dominio no modela', () => {
		const unsupported = { ...audioRecordingMock, type: 'pdfLink' } as unknown as Media;

		expect(() => narrowMedia(unsupported)).toThrow('El tipo pdfLink no está soportado.');
	});
});
