import { Meta, moduleMetadata } from '@storybook/angular';
import { SpotifyPodcastEpisodeWidget } from './spotify-podcast-episode-widget';
import { Media } from '@models/media.model';
import { spotifyPodcastEpisodeMock } from '@mocks/spotify-podcast-episode.mock';

export default {
	title: 'SpotifyPodcastEpisodeWidget',
	component: SpotifyPodcastEpisodeWidget,
	decorators: [
		moduleMetadata({
			imports: [],
		}),
	],
} as Meta<SpotifyPodcastEpisodeWidget>;

const media: Media = spotifyPodcastEpisodeMock;

export const Widget = () => ({
	props: {
		media: media,
	},
	template: `<cuentoneta-spotify-audio-widget class="block" [media]="media"></cuentoneta-spotify-audio-widget>`,
});
