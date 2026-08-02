import type { SanitizedHtml } from '@models/sanitized-html.model';

/**
 * Modelos del contenido multimedia vinculado a una obra o a una colección.
 *
 * `Media` es el tipo **ancho**: el de las colecciones y el que devuelve el ACL, con `data?: unknown`
 * porque el supertipo no correlaciona el tag con la forma de su carga. `MediaTypes` es el **angosto**,
 * la unión discriminada que consumen los widgets, donde cada tag ya fija su `data`. Se pasa de uno al
 * otro con los guards de abajo, nunca con una aserción.
 */
export interface Media {
	title: string;
	description: SanitizedHtml;
	type: MediaTypeKey;
	data?: unknown;
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
