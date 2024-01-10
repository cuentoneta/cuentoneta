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
	url: string;
	type: MediaTypeKey;
	data?: unknown;
}

export interface SpaceRecording extends Media {
	data: ITweet & { duration: string };
}

// TODO: #537 - Proveer tipo para tratamiendo de contenido multimedia de videos de YouTube
export type MediaTypes = SpaceRecording;
export type MediaTypeKey = 'spaceRecording';
