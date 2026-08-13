// Tipos de Sanity
import {
	CollectionBySlugQueryResult,
	LiteraryWorkBySlugQueryResult,
	StoryBySlugQueryResult,
	StorylistQueryResult,
} from '@sanity-types';

// Modelos
import {
	AudioRecording,
	Media,
	MediaTypeKey,
	SpaceRecording,
	SpotifyPodcastEpisode,
	YouTubeVideo,
} from '@models/media.model';
import { urlFor } from './functions';
import { createMarkdown } from '@models/markdown.model';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';

// El mapeo se invoca con la proyección de mediaSources de story, storylist, obra, teaser, colección y
// las obras de una colección. Hoy son estructuralmente idénticas salvo por `audioUrl`; aceptarlas
// todas explícitamente documenta el acoplamiento. Los shapes por tipo se derivan del generado por
// typegen: si una futura corrida diverge, el mapeo deja de compilar en vez de fallar en silencio.
type StoryMediaSources = NonNullable<StoryBySlugQueryResult>['mediaSources'];
type StorylistMediaSources = NonNullable<StorylistQueryResult>['mediaSources'];
type LiteraryWorkMediaSources = NonNullable<LiteraryWorkBySlugQueryResult>['mediaSources'];
type MediaResourcesTeasersSubquery = NonNullable<StorylistQueryResult>['stories'][0]['mediaSources'];
type CollectionMediaSources = NonNullable<CollectionBySlugQueryResult>['mediaSources'];
type CollectionWorkMediaSources = NonNullable<CollectionBySlugQueryResult>['literaryWorks'][number]['mediaSources'];

type MediaSource = (
	| StoryMediaSources
	| StorylistMediaSources
	| LiteraryWorkMediaSources
	| MediaResourcesTeasersSubquery
	| CollectionMediaSources
	| CollectionWorkMediaSources
)[number];

type AudioRecordingSource = Extract<StoryMediaSources[number], { _type: 'audioRecording' }>;
type SpaceRecordingSource = Extract<MediaSource, { _type: 'spaceRecording' }>;
type SpotifyPodcastEpisodeSource = Extract<StoryMediaSources[number], { _type: 'spotifyPodcastEpisode' }>;
type YouTubeVideoSource = Extract<StoryMediaSources[number], { _type: 'youTubeVideo' }>;

export function mapMediaSources(
	mediaSources:
		| StoryMediaSources
		| StorylistMediaSources
		| LiteraryWorkMediaSources
		| MediaResourcesTeasersSubquery
		| CollectionMediaSources
		| CollectionWorkMediaSources,
): Media[] {
	if (!mediaSources) return [];

	const media: Media[] = [];
	for (const mediaSource of mediaSources) {
		const mapped = mapMediaSourceOrDiscard(mediaSource);
		if (mapped) {
			media.push(mapped);
		}
	}
	return media;
}

// Un recurso cuya descripción no pase el pipeline se descarta con rastro, en vez de propagar y tirar la
// respuesta entera. `Rule.required()` no se aplica retroactivamente a documentos ya publicados, así que
// mientras el contenido cargado no migre puede llegar una descripción vacía o en el formato viejo: eso
// debe costar un widget, no la página. Misma contención que ya aplica el tipo no modelado.
function mapMediaSourceOrDiscard(mediaSource: MediaSource): Media | undefined {
	try {
		return mapMediaSource(mediaSource);
	} catch (error) {
		console.warn(`mediaSource descartado: su descripción no pudo mapearse`, {
			_key: mediaSource._key,
			_type: mediaSource._type,
			cause: error,
		});
		return undefined;
	}
}

function mapMediaSource(mediaSource: MediaSource): Media | undefined {
	switch (mediaSource._type) {
		case 'audioRecording':
			return getAudioRecordingData(mediaSource);
		case 'spaceRecording':
			return getSpaceRecordingData(mediaSource);
		case 'spotifyPodcastEpisode':
			return getSpotifyPodcastEpisodeData(mediaSource);
		case 'youTubeVideo':
			return getYoutubeVideoData(mediaSource);
		default: {
			// El schema admite tipos que el dominio no modela (hoy, pdfLink): se descartan en vez de
			// tirar la respuesta entera, porque son contenido que un editor cargó legítimamente. La
			// anotación cubre el otro caso: si se suma un MediaTypeKey sin su rama, deja de compilar.
			const unmappedType: Exclude<typeof mediaSource._type, MediaTypeKey> = mediaSource._type;
			console.warn(`mediaSource descartado: el tipo "${unmappedType}" no tiene modelo de dominio`, {
				_key: mediaSource._key,
			});
			return undefined;
		}
	}
}

function getAudioRecordingData(mediaSource: AudioRecordingSource): AudioRecording {
	return {
		title: mediaSource.title,
		type: mediaSource._type,
		description: markdownToSanitizedHtml(createMarkdown(mediaSource.description)),
		data: {
			url: mediaSource.url,
		},
	};
}

function getSpaceRecordingData(mediaSource: SpaceRecordingSource): SpaceRecording {
	return {
		title: mediaSource.title,
		type: mediaSource._type,
		description: markdownToSanitizedHtml(createMarkdown(mediaSource.description)),
		data: {
			// La proyección de teaser no resuelve audioUrl; el resto sí. Se pasa null tal cual (en vez
			// de '') para que el widget muestre un placeholder visible en vez de un reproductor roto.
			url: 'audioUrl' in mediaSource ? mediaSource.audioUrl : null,
			duration: mediaSource.duration,
			hostName: mediaSource.hostName,
			hostAvatar: mediaSource.hostAvatar ? urlFor(mediaSource.hostAvatar) : undefined,
			date: mediaSource.date,
		},
	};
}

function getYoutubeVideoData(mediaSource: YouTubeVideoSource): YouTubeVideo {
	return {
		title: mediaSource.title,
		type: mediaSource._type,
		description: markdownToSanitizedHtml(createMarkdown(mediaSource.description)),
		data: {
			videoId: mediaSource.videoId,
		},
	};
}

function getSpotifyPodcastEpisodeData(mediaSource: SpotifyPodcastEpisodeSource): SpotifyPodcastEpisode {
	return {
		title: mediaSource.title,
		type: mediaSource._type,
		description: markdownToSanitizedHtml(createMarkdown(mediaSource.description)),
		data: {
			url: mediaSource.url,
		},
	};
}
