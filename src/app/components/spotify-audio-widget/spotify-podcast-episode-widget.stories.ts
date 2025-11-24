import { Meta, StoryObj } from '@storybook/angular';
import { SpotifyPodcastEpisodeWidget } from './spotify-podcast-episode-widget';
import { spotifyPodcastEpisodeMock } from '@mocks/spotify-podcast-episode.mock';

const meta: Meta<SpotifyPodcastEpisodeWidget> = {
	title: 'Widgets/SpotifyPodcastEpisode',
	component: SpotifyPodcastEpisodeWidget,
	argTypes: {
		media: {
			description: 'Spotify podcast episode media object containing title, description, and Spotify embed URL',
			control: { type: 'object' },
		},
	},
};

export default meta;
type Story = StoryObj<SpotifyPodcastEpisodeWidget>;

export const Widget: Story = {
	args: {
		media: spotifyPodcastEpisodeMock,
	},
};
