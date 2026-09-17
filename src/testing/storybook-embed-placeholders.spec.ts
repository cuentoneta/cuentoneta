import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { render, screen } from '@testing-library/angular';

import { SpotifyPodcastEpisodeWidget } from '@components/spotify-audio-widget/spotify-podcast-episode-widget';
import { YoutubeVideoWidgetComponent } from '@components/youtube-video-widget/youtube-video-widget.component';
import {
	onoffAudioRecordingsMock,
	onoffSpotifyPodcastEpisodesMock,
	onoffYouTubeVideosMock,
} from '@mocks/onoff-media.mock';
import {
	CatalogEmbedPlaceholders,
	EMBED_PLACEHOLDERS,
	embedPlayerProviders,
	withEmbedPlaceholder,
	withEmbedPlaceholders,
} from './storybook-embed-placeholders';

describe('los placeholders de embed del catálogo', () => {
	// Una ilustración borrada dejaría al catálogo referenciando utilería inexistente, que es el mismo
	// reproductor roto con otra cara.
	it.each(Object.entries(EMBED_PLACEHOLDERS))('resuelve "%s" a un archivo que existe', (_key, path) => {
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

	// El player difiere la carga del video hasta el clic sobre su placeholder, así que lo que impide que el
	// catálogo salga a la red no es la configuración —que es la red de contención— sino dejarlo inerte.
	// Se monta el widget dentro del envoltorio, que es como lo monta una story.
	it('deja el placeholder del video inerte y repintado', async () => {
		const { container } = await render(
			`<cuentoneta-catalog-embed-placeholders><cuentoneta-youtube-video-widget [media]="media" /></cuentoneta-catalog-embed-placeholders>`,
			{
				imports: [CatalogEmbedPlaceholders, YoutubeVideoWidgetComponent],
				providers: embedPlayerProviders,
				componentProperties: { media: onoffYouTubeVideosMock[0] },
			},
		);

		/* eslint-disable testing-library/no-container, testing-library/no-node-access -- el placeholder del player es de terceros y no expone rol ni testid: solo se lo alcanza por selector */
		const placeholder = container.querySelector('youtube-player-placeholder');
		/* eslint-enable testing-library/no-container, testing-library/no-node-access */
		const applied = placeholder ? getComputedStyle(placeholder) : undefined;

		expect(applied?.pointerEvents).toBe('none');
		expect(applied?.backgroundImage).toContain(EMBED_PLACEHOLDERS.youTubeVideo);
	});
});
