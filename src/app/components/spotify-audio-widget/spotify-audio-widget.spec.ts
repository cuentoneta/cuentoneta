// Testing library
import { render, screen } from '@testing-library/angular';

// Component
import { SpotifyAudioWidget } from './spotify-audio-widget';

// Mocks
import { spotifyAudioMock } from '@mocks/spotify-audio.mock';

describe('SpotifyAudioWidget', () => {
	it('should render the component', async () => {
		const { container } = await render(SpotifyAudioWidget, {
			inputs: { media: spotifyAudioMock },
		});

		expect(container).toBeInTheDocument();
	});

	it('should render the spotify embed iframe', async () => {
		await render(SpotifyAudioWidget, {
			inputs: { media: spotifyAudioMock },
		});

		const spotifyEmbed = screen.getByTestId('spotify-embed') as HTMLIFrameElement;
		expect(spotifyEmbed).toBeInTheDocument();
	});

	it('should convert spotify url to embed url', async () => {
		await render(SpotifyAudioWidget, {
			inputs: { media: spotifyAudioMock },
		});

		const spotifyEmbed = screen.getByTestId('spotify-embed') as HTMLIFrameElement;
		expect(spotifyEmbed.src).toContain('embed/episode');
	});

	it('should display the spotify audio title', async () => {
		await render(SpotifyAudioWidget, {
			inputs: { media: spotifyAudioMock },
		});

		expect(
			screen.getByText(
				'A fascinating podcast episode exploring contemporary trends in Spanish literature and the voices shaping the literary landscape.',
			),
		).toBeInTheDocument();
	});

	it('should display the spotify audio description', async () => {
		await render(SpotifyAudioWidget, {
			inputs: { media: spotifyAudioMock },
		});

		expect(
			screen.getByText(
				'A fascinating podcast episode exploring contemporary trends in Spanish literature and the voices shaping the literary landscape.',
			),
		).toBeInTheDocument();
	});
});
