// Testing library
import { render, screen } from '@testing-library/angular';

// Component
import { SpotifyPodcastEpisodeWidget } from './spotify-podcast-episode-widget';

// Mocks
import { spotifyPodcastEpisodeMock } from '@mocks/spotify-podcast-episode.mock';

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
				'Narración del cuento parte del primer episodio del podcast "Historias narradas para ser escuchadas", producido por la Biblioteca Pedagógica de la Ciudad de Santa Fe.',
			),
		).toBeInTheDocument();
	});

	it('should display the spotify audio description', async () => {
		await render(SpotifyPodcastEpisodeWidget, {
			inputs: { media: spotifyPodcastEpisodeMock },
		});

		expect(
			screen.getByText(
				'Narración del cuento parte del primer episodio del podcast "Historias narradas para ser escuchadas", producido por la Biblioteca Pedagógica de la Ciudad de Santa Fe.',
			),
		).toBeInTheDocument();
	});
});
