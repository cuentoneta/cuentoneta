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
import { getTweetData } from './twitter-api';
import {
	AudioRecording,
	AudioRecordingSchemaObject,
	Media,
	MediaSchemaObject,
	SpaceRecordingSchemaObject,
} from '@models/media.model';

export function mapAuthor(rawAuthorData: any, language?: string): AuthorDTO {
	return {
		slug: rawAuthorData.slug.current,
		nationality: {
			country: rawAuthorData.nationality?.country,
			flag: urlFor(rawAuthorData.nationality?.flag)?.url(),
		},
		resources: mapResources(rawAuthorData.resources),
		imageUrl: rawAuthorData.image ? urlFor(rawAuthorData.image).url() : undefined,
		name: rawAuthorData.name,
		biography: rawAuthorData.biography,
	};
}

export function mapAuthorForStory(rawAuthorData: any, language?: string): AuthorDTO {
	return {
		slug: rawAuthorData.slug.current,
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

// TODO: #537 - Proveer tipos para tratamiento de contenido multimedia
export async function mapMediaSources(mediaSources: MediaSchemaObject[]): Promise<Media[]> {
	if (!mediaSources) return [];

	const media: Media[] = [];
	for (const mediaSource of mediaSources) {
		if (mediaSource._type === 'spaceRecording') {
			media.push(await getTweetData(mediaSource as SpaceRecordingSchemaObject));
		}
		if (mediaSource._type === 'audioRecording') {
			media.push(getAudioRecordingData(mediaSource as AudioRecordingSchemaObject));
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
