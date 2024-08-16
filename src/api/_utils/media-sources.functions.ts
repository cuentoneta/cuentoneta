import {
	AudioRecording,
	AudioRecordingSchemaObject,
	Media,
	MediaSchemaObject,
	SpaceRecordingSchemaObject,
	YoutubeVideoSchemaObject,
} from '@models/media.model';
import { getTweetData } from './twitter-api';

export async function mapMediaSources(mediaSources: MediaSchemaObject[]): Promise<Media[]> {
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

// TODO: Corregir estos duplicados (Bug mencionado en issue #969)
export function mapMediaSourcesForStorylist(mediaSources: MediaSchemaObject[]): Media[] {
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
				data: {},
				icon: mediaSource.icon,
			});
		}
		if (mediaSource._type === 'youTubeVideo') {
			media.push(getYoutubeVideoData(mediaSource as YoutubeVideoSchemaObject));
		}
	}
	return media;
}

export function getAudioRecordingData(mediaSource: AudioRecordingSchemaObject): AudioRecording {
	return {
		title: mediaSource.title,
		type: mediaSource._type,
		icon: mediaSource.icon,
		data: {
			url: mediaSource.url,
		},
	};
}

export function getYoutubeVideoData(mediaSource: YoutubeVideoSchemaObject) {
	return {
		title: mediaSource.title,
		type: mediaSource._type,
		icon: mediaSource.icon,
		data: {
			description: mediaSource.description,
			videoId: mediaSource.videoId,
		},
	};
}
