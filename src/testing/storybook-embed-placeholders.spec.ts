import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { YOUTUBE_PLAYER_CONFIG } from '@angular/youtube-player';
import { render, screen } from '@testing-library/angular';

import { SpotifyPodcastEpisodeWidget } from '@components/spotify-audio-widget/spotify-podcast-episode-widget';
import { YoutubeVideoWidgetComponent } from '@components/youtube-video-widget/youtube-video-widget.component';
import {
	onoffAudioRecordingsMock,
	onoffSpotifyPodcastEpisodesMock,
	onoffYouTubeVideosMock,
} from '@mocks/onoff-media.mock';
import {
	EMBED_PLACEHOLDERS,
	embedPlayerProviders,
	withEmbedPlaceholder,
	withEmbedPlaceholders,
} from './storybook-embed-placeholders';

describe('los placeholders de embed del catálogo', () => {
	// Una ilustración borrada dejaría al catálogo referenciando utilería inexistente, que es el mismo
	// reproductor roto con otra cara.
	it.each(Object.entries(EMBED_PLACEHOLDERS))('resolves "%s" to a file that exists', (_key, path) => {
		expect(existsSync(join(process.cwd(), 'src', path))).toBe(true);
	});

	describe('withEmbedPlaceholder', () => {
		it('reapunta el episodio de podcast a la ilustración local', () => {
			const episode = withEmbedPlaceholder(onoffSpotifyPodcastEpisodesMock[0]);

			expect(episode.data.url).toBe(EMBED_PLACEHOLDERS.spotifyPodcastEpisode);
		});

		it('conserva el resto del medio', () => {
			const [original] = onoffSpotifyPodcastEpisodesMock;

			const episode = withEmbedPlaceholder(original);

			expect(episode.title).toBe(original.title);
			expect(episode.description).toBe(original.description);
		});

		it.each([
			['una grabación de audio', onoffAudioRecordingsMock[0]],
			['un video', onoffYouTubeVideosMock[0]],
		])('devuelve %s sin tocar', (_label, media) => {
			expect(withEmbedPlaceholder(media)).toBe(media);
		});

		it('preserva el orden de la lista', () => {
			const sources = [onoffYouTubeVideosMock[0], onoffSpotifyPodcastEpisodesMock[0]];

			expect(withEmbedPlaceholders(sources).map((media) => media.type)).toEqual(sources.map((media) => media.type));
		});
	});

	// Los dos invariantes que hacen del catálogo algo que se mira sin red: el iframe apunta a un archivo
	// local y el player no sale a buscar la IFrame API de YouTube.
	it('sirve un iframe local en vez de salir a Spotify', async () => {
		await render(SpotifyPodcastEpisodeWidget, {
			inputs: { media: withEmbedPlaceholder(onoffSpotifyPodcastEpisodesMock[0]) },
		});

		const embed = screen.getByTestId('spotify-embed') as HTMLIFrameElement;

		expect(embed.src).not.toContain('open.spotify.com');
		expect(embed.src).toContain(EMBED_PLACEHOLDERS.spotifyPodcastEpisode);
	});

	// El player carga la IFrame API una sola vez por proceso, así que observar el DOM no distingue "no la
	// pidió" de "otro spec ya la pidió". Lo que sí es determinista es con qué configuración se lo monta.
	it('configura el player para no cargar la IFrame API', () => {
		const config = embedPlayerProviders.find(
			(provider): provider is { provide: unknown; useValue: { loadApi: boolean } } =>
				typeof provider === 'object' && 'provide' in provider && provider.provide === YOUTUBE_PLAYER_CONFIG,
		);

		expect(config?.useValue.loadApi).toBe(false);
	});

	// Sin la IFrame API el player nunca sustituye su placeholder por el embed, y el botón de reproducción
	// que el placeholder dibuja es lo único que lo delata desde afuera.
	it('deja el player en su placeholder', async () => {
		await render(YoutubeVideoWidgetComponent, {
			inputs: { media: onoffYouTubeVideosMock[0] },
			providers: embedPlayerProviders,
		});

		expect(screen.getByRole('button')).toBeInTheDocument();
	});
});
