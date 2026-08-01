import { isAudioRecording, isSpaceRecording, isSpotifyPodcastEpisode, isYouTubeVideo, type Media } from './media.model';
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
