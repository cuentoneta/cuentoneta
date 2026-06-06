// Tipos de Sanity
import { StoryBySlugQueryResult, StorylistQueryResult } from '../sanity/types';

// Modelos
import {
	AudioRecording,
	AudioRecordingSchemaObject,
	Media,
	SpaceRecording,
	SpotifyPodcasteEpisodeSchemaObject,
	SpotifyPodcastEpisode,
	YouTubeVideo,
	YoutubeVideoSchemaObject,
} from '@models/media.model';
import { mapBlockContentToTextParagraphs, urlFor } from './functions';

type MediaResourcesStorySubQuery = NonNullable<StoryBySlugQueryResult>['mediaSources'];
type SpaceRecordingSource = Extract<MediaResourcesStorySubQuery[number], { _type: 'spaceRecording' }>;
export function mapMediaSources(mediaSources: MediaResourcesStorySubQuery): Media[] {
	if (!mediaSources) return [];

	const media: Media[] = [];
	for (const mediaSource of mediaSources) {
		if (mediaSource._type === 'audioRecording') {
			media.push(getAudioRecordingData(mediaSource as AudioRecordingSchemaObject));
		}
		if (mediaSource._type === 'spaceRecording') {
			media.push(getSpaceRecordingData(mediaSource));
		}
		if (mediaSource._type === 'spotifyPodcastEpisode') {
			media.push(getSpotifyPodcastEpisodeData(mediaSource as SpotifyPodcasteEpisodeSchemaObject));
		}
		if (mediaSource._type === 'youTubeVideo') {
			media.push(getYoutubeVideoData(mediaSource as YoutubeVideoSchemaObject));
		}
	}
	return media;
}

type MediaResourcesTeasersSubquery = NonNullable<StorylistQueryResult>['stories'][0]['mediaSources'];
export function mapMediaSourcesTeasers(mediaSources: MediaResourcesTeasersSubquery): Media[] {
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
		if (mediaSource._type === 'spotifyPodcastEpisode') {
			media.push(getSpotifyPodcastEpisodeData(mediaSource as SpotifyPodcasteEpisodeSchemaObject));
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

function getSpaceRecordingData(mediaSource: SpaceRecordingSource): SpaceRecording {
	return {
		title: mediaSource.title,
		type: mediaSource._type,
		description: mapBlockContentToTextParagraphs(mediaSource.description),
		data: {
			url: mediaSource.audioUrl ?? '',
			duration: mediaSource.duration,
			hostName: mediaSource.hostName,
			hostAvatar: mediaSource.hostAvatar ? urlFor(mediaSource.hostAvatar) : undefined,
			date: mediaSource.date,
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

function getSpotifyPodcastEpisodeData(mediaSource: SpotifyPodcasteEpisodeSchemaObject): SpotifyPodcastEpisode {
	return {
		title: mediaSource.title,
		type: mediaSource._type,
		description: mapBlockContentToTextParagraphs(mediaSource.description),
		data: {
			url: mediaSource.url,
		},
	};
}
