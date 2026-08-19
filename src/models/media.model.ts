import type { SanitizedHtml } from '@models/sanitized-html.model';

/**
 * Modelos del contenido multimedia vinculado a una obra o a una colección.
 *
 * Dos ejes **ortogonales** los organizan, y conviene no confundirlos:
 *
 * 1. **Qué transporta la proyección.** `Media` es la vista **completa**, la de la página: trae la
 *    carga con la que un widget puede reproducir el recurso. `MediaTeaser` es la vista de
 *    **listado**: solo el tag, que es lo único que una tarjeta consume para pintar el ícono de la
 *    plataforma. Cada una tiene su proyección GROQ y su mapper; el teaser no puede prometer lo que
 *    su proyección no trae. `data` es obligatorio en `Media` justamente para sostener eso: si fuera
 *    opcional, un `MediaTeaser` sería asignable a `Media` y montar un widget desde un listado
 *    compilaría.
 * 2. **Cómo se correlaciona el tag con su carga.** Dentro de la vista completa, `Media` es el
 *    supertipo —`data: unknown`, sin correlación— y `MediaTypes` la unión discriminada que consumen
 *    los widgets, donde cada tag ya fija su `data`. Se pasa de uno al otro con los guards de abajo,
 *    nunca con una aserción.
 */
export interface MediaTeaser {
	readonly type: MediaTypeKey;
}

export interface Media {
	title: string;
	description: SanitizedHtml;
	type: MediaTypeKey;
	data: unknown;
}

export interface AudioRecording extends Media {
	data: { url: string };
}

export interface SpaceRecording extends Media {
	data: {
		url: string | null;
		duration: string;
		hostName: string;
		hostAvatar?: string;
		date: string;
	};
}

export interface YouTubeVideo extends Media {
	data: { videoId: string };
}

export interface SpotifyPodcastEpisode extends Media {
	data: { url: string };
}

export type MediaTypes = AudioRecording | SpaceRecording | YouTubeVideo | SpotifyPodcastEpisode;
export type MediaTypeKey = 'spaceRecording' | 'audioRecording' | 'youTubeVideo' | 'spotifyPodcastEpisode';

// Los guards discriminan por el tag y no por la forma de `data`: AudioRecording y
// SpotifyPodcastEpisode son estructuralmente idénticos ({ url }), así que inspeccionar `data` no
// puede distinguirlos. Alcanza porque el único productor de Media es el mapper del propio dominio.
export function isAudioRecording(media: Media): media is AudioRecording {
	return media.type === 'audioRecording';
}

export function isSpaceRecording(media: Media): media is SpaceRecording {
	return media.type === 'spaceRecording';
}

export function isYouTubeVideo(media: Media): media is YouTubeVideo {
	return media.type === 'youTubeVideo';
}

export function isSpotifyPodcastEpisode(media: Media): media is SpotifyPodcastEpisode {
	return media.type === 'spotifyPodcastEpisode';
}
