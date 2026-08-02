import { Meta, StoryObj } from '@storybook/angular-vite';
import { SpotifyPodcastEpisodeWidget } from './spotify-podcast-episode-widget';
import { onoffSpotifyPodcastEpisodesMock } from '@mocks/onoff-media.mock';

const meta: Meta<SpotifyPodcastEpisodeWidget> = {
	title: 'Widgets/SpotifyPodcastEpisode',
	component: SpotifyPodcastEpisodeWidget,
	parameters: {
		docs: {
			canvas: {
				sourceState: 'shown',
			},
		},
	},
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
		media: onoffSpotifyPodcastEpisodesMock[0],
	},
};
