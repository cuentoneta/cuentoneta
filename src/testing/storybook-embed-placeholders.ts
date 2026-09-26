import { Component, ViewEncapsulation } from '@angular/core';
import { YOUTUBE_PLAYER_CONFIG } from '@angular/youtube-player';
import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular-vite';

import type { Media } from '@models/media.model';
import { isSpotifyPodcastEpisode } from '@models/media.model';

const SPOTIFY_EMBED_PLACEHOLDER = 'assets/storybook/spotify-embed-placeholder.html';

export function withEmbedPlaceholder<T extends Media>(media: T): T {
	if (!isSpotifyPodcastEpisode(media)) {
		return media;
	}
	return { ...media, data: { ...media.data, url: SPOTIFY_EMBED_PLACEHOLDER } };
}

export function withEmbedPlaceholders(mediaSources: readonly Media[]): Media[] {
	return mediaSources.map(withEmbedPlaceholder);
}

// Los `!important` le ganan a la miniatura que el player escribe inline. Sin `pointer-events`, un clic
// cargaría el video real: el placeholder difiere la carga hasta ahí. El host en `contents` evita que el
// envoltorio, inline por defecto, altere la maquetación que la story muestra.
@Component({
	selector: 'cuentoneta-catalog-embed-placeholders',
	encapsulation: ViewEncapsulation.None,
	host: { class: 'contents' },
	template: `<ng-content />`,
	styles: `
		cuentoneta-catalog-embed-placeholders .youtube-player-placeholder {
			--play-size: clamp(48px, 14%, 88px);
			position: relative;
			background-color: #27272a !important;
			background-image: linear-gradient(to right, #a1a1aa 30%, #3f3f46 30%) !important;
			background-position: center bottom 7% !important;
			background-size: 92% 4px !important;
			background-repeat: no-repeat !important;
			cursor: default !important;
			pointer-events: none !important;
			box-shadow: none !important;
		}

		cuentoneta-catalog-embed-placeholders .youtube-player-placeholder-button {
			display: none !important;
		}

		/* El botón va con geometría y no con degradados: el navegador no suaviza los bordes de un degradado. */
		cuentoneta-catalog-embed-placeholders .youtube-player-placeholder::before {
			content: '';
			width: var(--play-size);
			aspect-ratio: 1;
			border-radius: 50%;
			background: #52525b;
		}

		cuentoneta-catalog-embed-placeholders .youtube-player-placeholder::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			width: calc(var(--play-size) * 0.34);
			aspect-ratio: 6 / 7;
			background: #e4e4e7;
			clip-path: polygon(0 0, 100% 50%, 0 100%);
			/* Corrido a la derecha: centrado geométrico, un triángulo se ve desplazado a la izquierda. */
			transform: translate(-40%, -50%);
		}
	`,
})
class CatalogEmbedPlaceholders {}

/** Cubre solo el video: el episodio de Spotify se sustituye pasando su medio por `withEmbedPlaceholder`. */
export const embedPlaceholdersDecorator = [
	moduleMetadata({
		imports: [CatalogEmbedPlaceholders],
		providers: [{ provide: YOUTUBE_PLAYER_CONFIG, useValue: { loadApi: false } }],
	}),
	componentWrapperDecorator(CatalogEmbedPlaceholders),
];
