import { Component, ViewEncapsulation, type Provider } from '@angular/core';
import { YOUTUBE_PLAYER_CONFIG } from '@angular/youtube-player';
import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular-vite';

import type { Media } from '@models/media.model';
import { isSpotifyPodcastEpisode } from '@models/media.model';

/**
 * Las ilustraciones con las que el catálogo ocupa el lugar de un embed de terceros.
 *
 * Son dibujos neutros de un reproductor, no capturas: una captura traería marcado de terceros al
 * repositorio. Cuelgan de `assets/storybook/` y no de `assets/img/mocks/`, que es territorio del corpus —
 * estos no son fixtures del elenco de Onoff sino utilería del catálogo.
 */
export const EMBED_PLACEHOLDERS = Object.freeze({
	youTubeVideo: 'assets/storybook/youtube-embed-placeholder.svg',
	spotifyPodcastEpisode: 'assets/storybook/spotify-embed-placeholder.svg',
} as const);

/**
 * El mismo medio, con la URL del episodio de Spotify reapuntada a la ilustración local. Cualquier otro
 * tipo vuelve idéntico.
 *
 * El corpus **conserva** su URL de plataforma, que es la forma que producción tiene y que el widget
 * reescribe a `embed/episode`. Lo que se sustituye es lo que el catálogo monta, no lo que el corpus
 * declara.
 */
export function withEmbedPlaceholder<T extends Media>(media: T): T {
	if (!isSpotifyPodcastEpisode(media)) {
		return media;
	}
	return { ...media, data: { ...media.data, url: EMBED_PLACEHOLDERS.spotifyPodcastEpisode } };
}

/** `withEmbedPlaceholder` sobre una lista de medios, preservando su orden. */
export function withEmbedPlaceholders(mediaSources: readonly Media[]): Media[] {
	return mediaSources.map(withEmbedPlaceholder);
}

// El fondo del placeholder del player lo escribe el propio componente como estilo inline, así que nada
// que no sea `!important` lo gana. Y el placeholder difiere la carga del video hasta el clic, así que
// neutralizar los eventos de puntero es lo que de verdad impide que el catálogo salga a la red.
//
// El host va en `display: contents` para que el envoltorio no interponga una caja: las stories que
// aplican este decorator evalúan maquetación, y un elemento custom es `inline` por defecto.
@Component({
	selector: 'cuentoneta-catalog-embed-placeholders',
	encapsulation: ViewEncapsulation.None,
	host: { class: 'contents' },
	template: `<ng-content />`,
	styles: `
		cuentoneta-catalog-embed-placeholders .youtube-player-placeholder {
			background-image: url('/assets/storybook/youtube-embed-placeholder.svg') !important;
			cursor: default !important;
			pointer-events: none !important;
			box-shadow: none !important;
		}

		cuentoneta-catalog-embed-placeholders .youtube-player-placeholder-button {
			display: none !important;
		}
	`,
})
export class CatalogEmbedPlaceholders {}

/**
 * La red de contención de la salida a la red del player, por si algo llegara a activar el placeholder:
 * sin la IFrame API no hay nada que cargar. Lo que impide que se active es el `pointer-events` de arriba.
 * Se exporta aparte del decorator para que un spec pueda montar el widget en las mismas condiciones.
 */
export const embedPlayerProviders: Provider[] = [{ provide: YOUTUBE_PLAYER_CONFIG, useValue: { loadApi: false } }];

/**
 * Sustituye en el catálogo los dos embeds de terceros por su ilustración local: el placeholder del video
 * queda repintado e inerte, y el player no carga la IFrame API de YouTube.
 *
 * Es solo la mitad de la sustitución — la que no tiene seam de datos, porque el `videoId` no es una URL.
 * El episodio de Spotify se reapunta pasando su medio por `withEmbedPlaceholder`.
 *
 * Va a la story y no al preview: no es una dependencia que cualquier componente del catálogo pueda
 * necesitar, sino algo que depende de estos componentes en concreto.
 */
export const embedPlaceholdersDecorator = [
	moduleMetadata({ imports: [CatalogEmbedPlaceholders], providers: embedPlayerProviders }),
	componentWrapperDecorator(CatalogEmbedPlaceholders),
];
