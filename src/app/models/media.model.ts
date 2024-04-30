import { ITweet } from 'rettiwt-api';

/**
 * Modelos relacionados a los distintos tipos de contenido multimedia que se
 * pueden encontrar vinculados a una Story o Storylist.
 *
 * La interfaz base Media define los atributos comunes a todos los tipos de
 * contenido multimedia y debe ser usada para definir el tipo de la propiedad media en DTOs.
 *
 * El tipo MediaTypes define la unión de tipos de contenido multimedia que se pueden
 * encontrar vinculados a una instancia definida de Story o Storylist.
 */
export interface Media {
	title: string;
	type: MediaTypeKey;
	icon: string;
	data?: unknown;
}

export interface AudioRecording extends Media {
	data: { url: string };
}

export interface SpaceRecording extends Media {
	data: ITweet & { duration: string };
}

export interface YouTubeRecording extends Media {
	data: { description: string; url: string };
}

// TODO: #537 - Proveer tipo para tratamiendo de contenido multimedia de videos de YouTube
export type MediaTypes = AudioRecording | SpaceRecording | YouTubeRecording;
export type MediaTypeKey = 'spaceRecording' | 'audioRecording' | 'youtubeRecording';

/**
 * Interfaces utilizadas por backend para definir los tipos de contenido multimedia
 */
export interface MediaSchemaObject {
	_id: string;
	_type: MediaTypeKey;
	title: string;
	icon: string;
}

export interface SpaceRecordingSchemaObject extends MediaSchemaObject {
	postId: string;
	spaceUrl: string;
	duration: string;
}

export interface AudioRecordingSchemaObject extends MediaSchemaObject {
	url: string;
}

export interface YoutubeVideoSchemaObject extends MediaSchemaObject {
	description: string;
	url: string;
}
