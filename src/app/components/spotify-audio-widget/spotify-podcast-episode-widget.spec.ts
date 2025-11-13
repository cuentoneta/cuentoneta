// Testing library
import { render, screen } from '@testing-library/angular';

// Component
import { SpotifyPodcastEpisodeWidget } from './spotify-podcast-episode-widget.js';

// Mocks
import { spotifyPodcastEpisodeMock } from '@mocks/spotify-podcast-episode.mock.js';

describe('SpotifyPodcastEpisodeWidget', () => {
	it('should render the component', async () => {
		const { container } = await render(SpotifyPodcastEpisodeWidget, {
			inputs: { media: spotifyPodcastEpisodeMock },
		});

		expect(container).toBeInTheDocument();
	});

	it('should render the spotify embed iframe', async () => {
		await render(SpotifyPodcastEpisodeWidget, {
			inputs: { media: spotifyPodcastEpisodeMock },
		});

		const spotifyEmbed = screen.getByTestId('spotify-embed') as HTMLIFrameElement;
		expect(spotifyEmbed).toBeInTheDocument();
	});

	it('should convert spotify url to embed url', async () => {
		await render(SpotifyPodcastEpisodeWidget, {
			inputs: { media: spotifyPodcastEpisodeMock },
		});

		const spotifyEmbed = screen.getByTestId('spotify-embed') as HTMLIFrameElement;
		expect(spotifyEmbed.src).toContain('embed/episode');
	});

	it('should display the spotify audio title', async () => {
		await render(SpotifyPodcastEpisodeWidget, {
			inputs: { media: spotifyPodcastEpisodeMock },
		});

		expect(
			screen.getByText(
				'A fascinating podcast episode exploring contemporary trends in Spanish literature and the voices shaping the literary landscape.',
			),
		).toBeInTheDocument();
	});

	it('should display the spotify audio description', async () => {
		await render(SpotifyPodcastEpisodeWidget, {
			inputs: { media: spotifyPodcastEpisodeMock },
		});

		expect(
			screen.getByText(
				'A fascinating podcast episode exploring contemporary trends in Spanish literature and the voices shaping the literary landscape.',
			),
		).toBeInTheDocument();
	});
});
