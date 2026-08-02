// Testing library
import { render, screen, within } from '@testing-library/angular';

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

	// La descripción llega como HTML saneado y se pinta con [innerHTML]: se verifica el texto completo y
	// que el marcado sobreviva, para distinguir "se pintó el HTML" de "se pintó el string escapado". El
	// contenedor es un div, no un p: el pipeline emite <p>…</p> y anidarlo lo rompería.
	it('should display the spotify audio description as rendered HTML', async () => {
		await render(SpotifyPodcastEpisodeWidget, {
			inputs: { media: onoffSpotifyPodcastEpisodesMock[0] },
		});

		const description = screen.getByTestId('media-description');

		expect(description.tagName.toLowerCase()).toBe('div');
		expect(description.textContent?.trim()).toBe(mediaDescriptionText(onoffSpotifyPodcastEpisodesMock[0]));
		// El énfasis fuerte del Markdown del fixture: si el HTML se hubiera escapado, el texto seguiría
		// estando pero no habría un elemento propio que lo contenga.
		expect(within(description).getByText('podcast').tagName.toLowerCase()).toBe('strong');
	});
});
