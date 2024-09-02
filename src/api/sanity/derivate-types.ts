/**
 * En este archivo se definen los tipos de datos que se derivan de los tipos de datos básicos usados en
 * nuestros schemas de Sanity, a fin de abordar y simplificar los tipos de datos redundantes generados por
 * Sanity Codegen.
 */

// Tipos de Sanity
import {
	BlockContent,
	IconPicker,
	internalGroqTypeReferenceTo,
	SanityImageCrop,
	SanityImageHotspot,
	Slug,
} from './generated-schema-types';

// Localización
import { languageCodes } from '../../../cms/utils/localization';

export type BiographySubQueryResult = {
	es?: BlockContent;
	en?: BlockContent;
	[key: string]: BlockContent | undefined;
};

export type ImageQueryResult = {
	asset?: {
		_ref: string;
		_type: 'reference';
		_weak?: boolean;
		[internalGroqTypeReferenceTo]?: 'sanity.imageAsset';
	};
	hotspot?: SanityImageHotspot;
	crop?: SanityImageCrop;
	_type: 'image';
};

export type MediaResourcesSubQueryResult = Array<
	| {
			url?: string;
			title: string;
			_type: 'audioRecording';
			_key: string;
	  }
	| {
			url?: string;
			postId?: string;
			duration?: string;
			title: string;
			_type: 'spaceRecording';
			_key: string;
	  }
	| {
			description?: BlockContent;
			videoId?: string;
			title: string;
			_type: 'youTubeVideo';
			_key: string;
	  }
>;

export type NationalitySubQueryResult = {
	_id: string;
	_type: 'nationality';
	_createdAt: string;
	_updatedAt: string;
	_rev: string;
	country: string;
	flag: ImageQueryResult;
};

export type PublicationSubQueryResult = Array<{
	publishingOrder: number;
	publishingDate: string;
	published: boolean;
	story: {
		slug: string;
		title: string;
		language: 'en' | 'es';
		badLanguage: boolean;
		categories: Array<never>;
		body: BlockContent;
		originalPublication: string;
		approximateReadingTime: number;
		mediaSources: MediaResourcesSubQueryResult;
		author: {
			slug: Slug;
			name: string;
			image: ImageQueryResult;
			nationality: NationalitySubQueryResult;
		};
	};
}>;

export type ResourceSubQueryResult =
	| Array<{
			title: string;
			url: string;
			resourceType: {
				title: string;
				description: string;
				icon: IconPicker;
			};
	  }>
	| Array<never>;

export type SupportedLanguageCodes = (typeof languageCodes)[number];

export type TagsSubQueryResult =
	| Array<{
			title: string;
			slug: string;
			description: string;
			icon: IconPicker;
	  }>
	| Array<never>;
