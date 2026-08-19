import type {
	AudioRecording,
	Media,
	MediaTeaser,
	SpaceRecording,
	SpotifyPodcastEpisode,
	YouTubeVideo,
} from '@models/media.model';
import { isAudioRecording, isSpaceRecording, isSpotifyPodcastEpisode, isYouTubeVideo } from '@models/media.model';
import { geometriaMediaMock } from './onoff/media/geometria.media.mock';

// Canon de multimedia del corpus. Sale de la única obra que declara medios, así que no hay una lista
// en paralelo que mantener: enriquecer esa obra alcanza a todos los consumidores.
export const onoffMediaMock: Media[] = geometriaMediaMock;

// Selectores por tipo, derivados con los type guards del propio dominio en vez de por el tag a mano:
// así el estrechamiento que hace un spec es el mismo que hace el código de producción.
export const onoffAudioRecordingsMock: AudioRecording[] = onoffMediaMock.filter(isAudioRecording);
export const onoffSpaceRecordingsMock: SpaceRecording[] = onoffMediaMock.filter(isSpaceRecording);
export const onoffYouTubeVideosMock: YouTubeVideo[] = onoffMediaMock.filter(isYouTubeVideo);
export const onoffSpotifyPodcastEpisodesMock: SpotifyPodcastEpisode[] = onoffMediaMock.filter(isSpotifyPodcastEpisode);

// La vista de teaser se deriva de la completa, igual que los selectores de arriba: es la misma
// pérdida de información que hace el ACL al mapear la proyección de listado, y no una lista aparte
// que podría divergir del canon.
export function toMediaTeaser(media: Media): MediaTeaser {
	return { type: media.type };
}

export const onoffMediaTeasersMock: MediaTeaser[] = onoffMediaMock.map(toMediaTeaser);

// El texto plano de una descripción, para que las specs de los widgets afirmen contra el fixture en vez
// de repetir su texto literal. Vive acá, y no en cada spec, para que todas compartan un mismo criterio
// de aplanado: los tags que separan dejan un espacio y los inline se quitan sin él —igual que el
// aplanado del JSON-LD de autor—, porque si no un salto de línea pega la última palabra de un renglón
// con la primera del siguiente.
export function mediaDescriptionText(media: Media): string {
	return media.description
		.replace(/<\/?(?:p|div|br|hr|blockquote|li|ul|ol)\b[^>]*>/gi, ' ')
		.replace(/<[^>]+>/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}
