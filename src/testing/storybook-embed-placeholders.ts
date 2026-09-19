import { Component, ViewEncapsulation } from '@angular/core';
import { YOUTUBE_PLAYER_CONFIG } from '@angular/youtube-player';
import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular-vite';

import type { Media } from '@models/media.model';
import { isSpotifyPodcastEpisode } from '@models/media.model';

/**
 * La página local que el iframe del episodio de Spotify carga en el catálogo: un reproductor neutro
 * dibujado con CSS, que responde al ancho del iframe igual que el embed real. Cuelga de `assets/storybook/`
 * y no de `assets/img/mocks/`, que es territorio del corpus — es utilería del catálogo, no un fixture.
 */
const SPOTIFY_EMBED_PLACEHOLDER = 'assets/storybook/spotify-embed-placeholder.html';

/**
 * El mismo medio, con la URL del episodio de Spotify reapuntada a la página local. Cualquier otro tipo
 * vuelve idéntico.
 *
 * El corpus **conserva** su URL de plataforma, que es la forma que producción tiene y que el widget
 * reescribe a `embed/episode`. Lo que se sustituye es lo que el catálogo monta, no lo que el corpus
 * declara.
 */
export function withEmbedPlaceholder<T extends Media>(media: T): T {
	if (!isSpotifyPodcastEpisode(media)) {
		return media;
	}
	return { ...media, data: { ...media.data, url: SPOTIFY_EMBED_PLACEHOLDER } };
}

/** `withEmbedPlaceholder` sobre una lista de medios, preservando su orden. */
export function withEmbedPlaceholders(mediaSources: readonly Media[]): Media[] {
	return mediaSources.map(withEmbedPlaceholder);
}

// El placeholder del player ya tiene la geometría del embed —ancho completo, proporción de video—, así que
// se lo pinta a él en vez de estirarle una imagen: el reproductor se dibuja en unidades relativas a su
// propia caja y acompaña cualquier ancho. Su fondo lo escribe el player como estilo inline —la miniatura
// de un video que no existe—, y nada que no sea `!important` lo gana.
//
// El placeholder difiere la carga del video hasta el clic, así que neutralizar los eventos de puntero es lo
// que de verdad impide que el catálogo salga a la red.
//
// El botón de reproducción se dibuja con geometría —`border-radius` para el círculo, `clip-path` para el
// triángulo— y no con degradados: el navegador suaviza los bordes de la geometría, pero evalúa un degradado
// píxel por píxel, así que un corte de color inclinado o curvo sale serruchado. La barra de progreso sí va
// como degradado porque es rectangular: sus bordes caen alineados a los píxeles.
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

		/* El círculo del botón, centrado por el flex del placeholder. */
		cuentoneta-catalog-embed-placeholders .youtube-player-placeholder::before {
			content: '';
			width: var(--play-size);
			aspect-ratio: 1;
			border-radius: 50%;
			background: #52525b;
		}

		/* El triángulo, sobre el centro del círculo y corrido a la derecha para que se lea centrado. */
		cuentoneta-catalog-embed-placeholders .youtube-player-placeholder::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			width: calc(var(--play-size) * 0.34);
			aspect-ratio: 6 / 7;
			background: #e4e4e7;
			clip-path: polygon(0 0, 100% 50%, 0 100%);
			transform: translate(-40%, -50%);
		}
	`,
})
class CatalogEmbedPlaceholders {}

/**
 * Sustituye en el catálogo los dos embeds de terceros por un reproductor de utilería: el placeholder del
 * video queda repintado e inerte, y el player no carga la IFrame API de YouTube.
 *
 * Es solo la mitad de la sustitución — la que no tiene seam de datos, porque el `videoId` no es una URL.
 * El episodio de Spotify se reapunta pasando su medio por `withEmbedPlaceholder`.
 *
 * Va a la story y no al preview: no es una dependencia que cualquier componente del catálogo pueda
 * necesitar, sino algo que depende de estos componentes en concreto.
 */
export const embedPlaceholdersDecorator = [
	moduleMetadata({
		imports: [CatalogEmbedPlaceholders],
		// La red de contención por si algo llegara a activar el placeholder: sin la IFrame API no hay nada
		// que cargar. Lo que impide que se active es el `pointer-events` del envoltorio.
		providers: [{ provide: YOUTUBE_PLAYER_CONFIG, useValue: { loadApi: false } }],
	}),
	componentWrapperDecorator(CatalogEmbedPlaceholders),
];
