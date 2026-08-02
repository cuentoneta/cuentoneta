import { isAudioRecording, isSpaceRecording, isSpotifyPodcastEpisode, isYouTubeVideo, type Media } from './media.model';
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
