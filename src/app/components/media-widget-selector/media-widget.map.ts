import type { Type } from '@angular/core';
import type { Media, MediaTypeKey } from '@models/media.model';

import { AudioRecordingWidgetComponent } from '@components/audio-recording-widget/audio-recording-widget.component';
import { SpaceRecordingWidgetComponent } from '@components/space-recording-widget/space-recording-widget.component';
import { SpotifyPodcastEpisodeWidget } from '@components/spotify-audio-widget/spotify-podcast-episode-widget';
import { YoutubeVideoWidgetComponent } from '@components/youtube-video-widget/youtube-video-widget.component';

export type MediaWidget =
	| AudioRecordingWidgetComponent
	| SpaceRecordingWidgetComponent
	| SpotifyPodcastEpisodeWidget
	| YoutubeVideoWidgetComponent;

/**
 * El catálogo de qué widget monta cada tipo de medio, y la única cara por la que se resuelve esa
 * pregunta. Vive fuera de todo componente porque lo consultan dos despachadores con políticas
 * distintas —uno monta todos los medios de una obra, el otro solo el elegido— y un catálogo por
 * despachador dejaría que un tipo nuevo llegue a uno y no al otro.
 *
 * Al ser un `Record` sobre la unión de tags, agregar un `MediaTypeKey` sin su widget no compila: el
 * tipo no mapeado se descubre en el gate y no en la página, con un hueco donde iba el reproductor.
 */
export const MEDIA_WIDGETS: Record<MediaTypeKey, Type<MediaWidget>> = Object.freeze({
	audioRecording: AudioRecordingWidgetComponent,
	spaceRecording: SpaceRecordingWidgetComponent,
	spotifyPodcastEpisode: SpotifyPodcastEpisodeWidget,
	youTubeVideo: YoutubeVideoWidgetComponent,
});

/**
 * El adaptador que `ngComponentOutlet` necesita: el medio de dominio entra como dato y sale como el
 * par (componente, inputs) que el outlet monta. Los widgets declaran su `media` con el tipo angosto
 * —`AudioRecording`, `YouTubeVideo`— y acá entra el ancho, así que el estrechamiento lo hace el
 * propio catálogo al aparear tag y componente; el outlet no lo verifica en tiempo de compilación.
 */
export function toMediaWidget(media: Media): { component: Type<MediaWidget>; inputs: { media: Media } } {
	const component = MEDIA_WIDGETS[media.type];
	// El `Record` cierra el caso para quien llega tipado, pero el tag viaja desde el CMS: un tipo que el
	// schema admita y el dominio todavía no modele entra acá con una clave que el catálogo no tiene, y sin
	// esto el outlet recibiría `undefined` y dejaría un hueco mudo donde iba el reproductor.
	if (!component) {
		throw new Error(`El tipo ${media.type} no está soportado.`);
	}
	return { component, inputs: { media } };
}
