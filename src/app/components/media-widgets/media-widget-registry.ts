import type { Type } from '@angular/core';
import type { Media, MediaTypeKey } from '@models/media.model';
import { AudioRecordingWidgetComponent } from '@components/audio-recording-widget/audio-recording-widget.component';
import { SpaceRecordingWidgetComponent } from '@components/space-recording-widget/space-recording-widget.component';
import { SpotifyPodcastEpisodeWidget } from '@components/spotify-audio-widget/spotify-podcast-episode-widget';
import { YoutubeVideoWidgetComponent } from '@components/youtube-video-widget/youtube-video-widget.component';

export type MediaWidget =
	| AudioRecordingWidgetComponent
	| SpaceRecordingWidgetComponent
	| YoutubeVideoWidgetComponent
	| SpotifyPodcastEpisodeWidget;

export interface MediaWidgetOutlet {
	readonly component: Type<MediaWidget>;
	readonly inputs: { readonly media: Media };
}

// El `satisfies` va adentro del `Object.freeze` y no como anotación del `const`: al pasar el literal
// como argumento deja de ser fresco, así que una clave fuera de `MediaTypeKey` se colaría sin que el
// compilador la mire. Verificado en ambas direcciones — falta una entrada y sobra una entrada cortan.
export const mediaWidgetRegistry = Object.freeze({
	audioRecording: AudioRecordingWidgetComponent,
	spaceRecording: SpaceRecordingWidgetComponent,
	spotifyPodcastEpisode: SpotifyPodcastEpisodeWidget,
	youTubeVideo: YoutubeVideoWidgetComponent,
} satisfies Record<MediaTypeKey, Type<MediaWidget>>);

export function toMediaWidgetOutlet(media: Media): MediaWidgetOutlet {
	// El `Record` cierra el caso para quien llega tipado, pero el tag viaja desde el CMS y nadie lo
	// valida en el borde: sin este corte, un tipo publicado antes de que exista su widget dejaría un
	// hueco mudo donde iba el reproductor.
	const component = mediaWidgetRegistry[media.type];
	if (!component) {
		throw new Error(`El tipo ${media.type} no está soportado.`);
	}
	return { component, inputs: { media } };
}
