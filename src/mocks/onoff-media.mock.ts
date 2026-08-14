import type { AudioRecording, Media, SpaceRecording, SpotifyPodcastEpisode, YouTubeVideo } from '@models/media.model';
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

// El texto plano de una descripción, para que las specs de los widgets afirmen sobre el fixture en vez
// de clavar prosa. Vive acá y no en cada spec porque la forma de `description` depende del modelo de
// contenido: un solo sitio se adapta.
export function mediaDescriptionText(media: Media): string {
	// Los tags que separan texto dejan un espacio al desaparecer —si no, un salto de línea pegaría la
	// última palabra con la primera de la línea siguiente—; los inline se quitan sin espacio, porque
	// abren y cierran dentro de la oración. Mismo criterio que el aplanado del JSON-LD de autor.
	return media.description
		.replace(/<\/?(?:p|div|br|hr|blockquote|li|ul|ol)\b[^>]*>/gi, ' ')
		.replace(/<[^>]+>/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}
