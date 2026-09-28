import type { Type } from '@angular/core';
import type { Media, MediaTypeKey } from '@models/media.model';
import { AudioRecordingWidget } from '@components/audio-recording-widget/audio-recording-widget';
import { SpaceRecordingWidget } from '@components/space-recording-widget/space-recording-widget';
import { SpotifyPodcastEpisodeWidget } from '@components/spotify-audio-widget/spotify-podcast-episode-widget';
import { YoutubeVideoWidget } from '@components/youtube-video-widget/youtube-video-widget';

export type MediaWidget =
	AudioRecordingWidget | SpaceRecordingWidget | YoutubeVideoWidget | SpotifyPodcastEpisodeWidget;

export interface MediaWidgetOutlet {
	readonly component: Type<MediaWidget>;
	readonly inputs: { readonly media: Media };
}

// El `satisfies` va adentro del `Object.freeze` y no como anotación del `const`: al pasar el literal
// como argumento deja de ser fresco, así que una clave fuera de `MediaTypeKey` se colaría sin que el
// compilador la mire. Verificado en ambas direcciones — falta una entrada y sobra una entrada cortan.
export const mediaWidgetRegistry = Object.freeze({
	audioRecording: AudioRecordingWidget,
	spaceRecording: SpaceRecordingWidget,
	spotifyPodcastEpisode: SpotifyPodcastEpisodeWidget,
	youTubeVideo: YoutubeVideoWidget,
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
