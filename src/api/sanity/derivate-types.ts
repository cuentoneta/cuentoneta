import {
	BlockContent,
	IconPicker,
	internalGroqTypeReferenceTo,
	SanityImageCrop,
	SanityImageHotspot,
} from './generated-schema-types';
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

export type MediaResourcesSubQueryResult =
	| Array<
			| {
					_type: 'audioRecording';
					title: string;
					url: string;
			  }
			| {
					_type: 'spaceRecording';
					title: string;
					url: string;
			  }
			| {
					_type: 'youTubeVideo';
					title: string;
					url: null;
			  }
	  >
	| Array<never>;

export type NationalitySubQueryResult = {
	_id: string;
	_type: 'nationality';
	_createdAt: string;
	_updatedAt: string;
	_rev: string;
	country: string;
	flag: ImageQueryResult;
};

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
