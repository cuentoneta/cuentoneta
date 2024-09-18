// 3rd party modules
import { getTweetData } from './twitter-api';

// Tipos de Sanity
import { MediaResourcesSubQueryResult } from '../sanity/derivate-types';

// Modelos
import {
	AudioRecording,
	AudioRecordingSchemaObject,
	Media,
	SpaceRecordingSchemaObject,
	YouTubeVideo,
	YoutubeVideoSchemaObject,
} from '@models/media.model';
import { mapBlockContentToTextParagraphs } from './functions';

export async function mapMediaSources(mediaSources: MediaResourcesSubQueryResult): Promise<Media[]> {
	if (!mediaSources) return [];

	const media: Media[] = [];
	for (const mediaSource of mediaSources) {
		if (mediaSource._type === 'audioRecording') {
			media.push(getAudioRecordingData(mediaSource as AudioRecordingSchemaObject));
		}
		if (mediaSource._type === 'spaceRecording') {
			media.push(await getTweetData(mediaSource as SpaceRecordingSchemaObject));
		}
		if (mediaSource._type === 'youTubeVideo') {
			media.push(getYoutubeVideoData(mediaSource as YoutubeVideoSchemaObject));
		}
	}
	return media;
}

export function mapMediaSourcesForStorylist(mediaSources: MediaResourcesSubQueryResult): Media[] {
	if (!mediaSources) return [];

	const media: Media[] = [];
	for (const mediaSource of mediaSources) {
		if (mediaSource._type === 'audioRecording') {
			media.push(getAudioRecordingData(mediaSource as AudioRecordingSchemaObject));
		}
		if (mediaSource._type === 'spaceRecording') {
			media.push({
				title: mediaSource.title,
				type: 'spaceRecording',
				description: mapBlockContentToTextParagraphs(mediaSource.description),
				data: {},
			});
		}
		if (mediaSource._type === 'youTubeVideo') {
			media.push(getYoutubeVideoData(mediaSource as YoutubeVideoSchemaObject));
		}
	}
	return media;
}

function getAudioRecordingData(mediaSource: AudioRecordingSchemaObject): AudioRecording {
	return {
		title: mediaSource.title,
		type: mediaSource._type,
		description: mapBlockContentToTextParagraphs(mediaSource.description),
		data: {
			url: mediaSource.url,
		},
	};
}

function getYoutubeVideoData(mediaSource: YoutubeVideoSchemaObject): YouTubeVideo {
	return {
		title: mediaSource.title,
		type: mediaSource._type,
		description: mapBlockContentToTextParagraphs(mediaSource.description),
		data: {
			videoId: mediaSource.videoId,
		},
	};
}
