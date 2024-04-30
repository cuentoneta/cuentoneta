// Conector a Sanity
import { client } from '../_helpers/sanity-connector';

// Tipos de Sanity
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { ImageUrlBuilder } from '@sanity/image-url/lib/types/builder';

// Sanity utils
import imageUrlBuilder from '@sanity/image-url';
import { baseLanguage } from '../../../cms/utils/localization';

// Modelos
import { AuthorDTO } from '@models/author.model';
import { PrologueDTO } from '@models/prologue.model';
import { getTweetData } from './twitter-api';
import {
	AudioRecording,
	AudioRecordingSchemaObject,
	Media,
	MediaSchemaObject,
	SpaceRecording,
	SpaceRecordingSchemaObject,
	YoutubeVideoSchemaObject,
} from '@models/media.model';

export function mapAuthor(rawAuthorData: any, language?: string): AuthorDTO {
	return {
		id: rawAuthorData._id,
		nationality: {
			country: rawAuthorData.nationality?.country,
			flag: urlFor(rawAuthorData.nationality?.flag)?.url(),
		},
		resources: mapResources(rawAuthorData.resources),
		imageUrl: rawAuthorData.image ? urlFor(rawAuthorData.image).url() : undefined,
		name: rawAuthorData.name,
		biography: rawAuthorData.biography ? rawAuthorData.biography[language || baseLanguage!.id] : undefined,
	};
}

export function mapPrologues(rawProloguesData: any): PrologueDTO[] {
	return rawProloguesData
		? rawProloguesData.map((x: { fwAuthor: any; fwText: any }) => ({
				reference: x.fwAuthor,
				text: x.fwText,
			}))
		: [];
}

export function urlFor(source: SanityImageSource): ImageUrlBuilder {
	return imageUrlBuilder(client).image(source);
}

export function mapResources(resources: any[]) {
	return (
		resources?.map((resource: any) => ({
			...resource,
			resourceType: {
				...resource.resourceType,
				icon: {
					...resource.resourceType.icon,
					svg: `data:image/svg+xml,${resource.resourceType.icon.svg}`,
				},
			},
		})) ?? []
	);
}

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
		if (mediaSource._type === 'youtubeRecording') {
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
			url: mediaSource.url,
		},
	};
}
