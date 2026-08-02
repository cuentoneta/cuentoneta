// Testing library
import { render, screen } from '@testing-library/angular';

// Component
import { SpotifyPodcastEpisodeWidget } from './spotify-podcast-episode-widget';

// Mocks
import { mediaDescriptionText, onoffSpotifyPodcastEpisodesMock } from '@mocks/onoff-media.mock';

describe('SpotifyPodcastEpisodeWidget', () => {
	it('should render the component', async () => {
		const { container } = await render(SpotifyPodcastEpisodeWidget, {
			inputs: { media: onoffSpotifyPodcastEpisodesMock[0] },
		});

		expect(container).toBeInTheDocument();
	});

	it('should render the spotify embed iframe', async () => {
		await render(SpotifyPodcastEpisodeWidget, {
			inputs: { media: onoffSpotifyPodcastEpisodesMock[0] },
		});

		const spotifyEmbed = screen.getByTestId('spotify-embed') as HTMLIFrameElement;
		expect(spotifyEmbed).toBeInTheDocument();
	});

	it('should convert spotify url to embed url', async () => {
		await render(SpotifyPodcastEpisodeWidget, {
			inputs: { media: onoffSpotifyPodcastEpisodesMock[0] },
		});

		const spotifyEmbed = screen.getByTestId('spotify-embed') as HTMLIFrameElement;
		expect(spotifyEmbed.src).toContain('embed/episode');
	});

	// El widget no pinta el título del medio: solo el embed y la descripción. La aserción que antes lo daba
	// por renderizado pasaba porque el fixture repetía el mismo texto en ambos campos.
	it('should not display the spotify audio title', async () => {
		await render(SpotifyPodcastEpisodeWidget, {
			inputs: { media: onoffSpotifyPodcastEpisodesMock[0] },
		});

		expect(screen.queryByText(onoffSpotifyPodcastEpisodesMock[0].title)).not.toBeInTheDocument();
	});

	it('should display the spotify audio description', async () => {
		await render(SpotifyPodcastEpisodeWidget, {
			inputs: { media: onoffSpotifyPodcastEpisodesMock[0] },
		});

		expect(screen.getByText(mediaDescriptionText(onoffSpotifyPodcastEpisodesMock[0]))).toBeInTheDocument();
	});
});
