/**
 * En este archivo se agrupan los tipos de datos nativos de Sanity generados por Sanity Codegen.
 */

import { ImageQueryResult, MediaResourcesSubQueryResult } from './derivate-types';

// Source: schema.json
export type SanityImagePaletteSwatch = {
	_type: 'sanity.imagePaletteSwatch';
	background?: string;
	foreground?: string;
	population?: number;
	title?: string;
};

export type SanityImagePalette = {
	_type: 'sanity.imagePalette';
	darkMuted?: SanityImagePaletteSwatch;
	lightVibrant?: SanityImagePaletteSwatch;
	darkVibrant?: SanityImagePaletteSwatch;
	vibrant?: SanityImagePaletteSwatch;
	dominant?: SanityImagePaletteSwatch;
	lightMuted?: SanityImagePaletteSwatch;
	muted?: SanityImagePaletteSwatch;
};

export type SanityImageDimensions = {
	_type: 'sanity.imageDimensions';
	height?: number;
	width?: number;
	aspectRatio?: number;
};

export type SanityFileAsset = {
	_id: string;
	_type: 'sanity.fileAsset';
	_createdAt: string;
	_updatedAt: string;
	_rev: string;
	originalFilename?: string;
	label?: string;
	title?: string;
	description?: string;
	altText?: string;
	sha1hash?: string;
	extension?: string;
	mimeType?: string;
	size?: number;
	assetId?: string;
	uploadId?: string;
	path?: string;
	url?: string;
	source?: SanityAssetSourceData;
};

export type Geopoint = {
	_type: 'geopoint';
	lat?: number;
	lng?: number;
	alt?: number;
};

export type Tag = {
	_id: string;
	_type: 'tag';
	_createdAt: string;
	_updatedAt: string;
	_rev: string;
	title: string;
	slug: Slug;
	description: string;
	icon: IconPicker;
};

export type Storylist = {
	_id: string;
	_type: 'storylist';
	_createdAt: string;
	_updatedAt: string;
	_rev: string;
	title: string;
	slug: Slug;
	description: BlockContent;
	language: 'es' | 'en';
	displayDates: boolean;
	comingNextLabel: string;
	editionPrefix: string;
	featuredImage: ImageQueryResult;
	tags?: Array<{
		_ref: string;
		_type: 'reference';
		_weak?: boolean;
		_key: string;
		[internalGroqTypeReferenceTo]?: 'tag';
	}>;
	publications?: Array<{
		story: {
			_ref: string;
			_type: 'reference';
			_weak?: boolean;
			[internalGroqTypeReferenceTo]?: 'story';
		};
		published: boolean;
		publishingOrder: number;
		publishingDate: string;
		_type: 'publication';
		_key: string;
	}>;
};

export type LandingPage = {
	_id: string;
	_type: 'landingPage';
	_createdAt: string;
	_updatedAt: string;
	_rev: string;
	config: string;
	slug: Slug;
	active: boolean;
	previews?: Array<{
		_ref: string;
		_type: 'reference';
		_weak?: boolean;
		_key: string;
		[internalGroqTypeReferenceTo]?: 'storylist';
	}>;
	cards?: Array<{
		_ref: string;
		_type: 'reference';
		_weak?: boolean;
		_key: string;
		[internalGroqTypeReferenceTo]?: 'storylist';
	}>;
};

export type Resource = {
	_type: 'resource';
	title: string;
	url: string;
	resourceType: {
		_ref: string;
		_type: 'reference';
		_weak?: boolean;
		[internalGroqTypeReferenceTo]?: 'resourceType';
	};
};

export type Publication = {
	_type: 'publication';
	story: {
		_ref: string;
		_type: 'reference';
		_weak?: boolean;
		[internalGroqTypeReferenceTo]?: 'story';
	};
	published: boolean;
	publishingOrder: number;
	publishingDate: string;
};

export type Story = {
	_id: string;
	_type: 'story';
	_createdAt: string;
	_updatedAt: string;
	_rev: string;
	title: string;
	slug: Slug;
	language: 'es' | 'en';
	author: {
		_ref: string;
		_type: 'reference';
		_weak?: boolean;
		[internalGroqTypeReferenceTo]?: 'author';
	};
	mediaSources?: MediaResourcesSubQueryResult;
	resources?: Array<{
		title: string;
		url: string;
		resourceType: {
			_ref: string;
			_type: 'reference';
			_weak?: boolean;
			[internalGroqTypeReferenceTo]?: 'resourceType';
		};
		_type: 'resource';
		_key: string;
	}>;
	badLanguage: boolean;
	approximateReadingTime: number;
	epigraphs?: Array<{
		text: BlockContent;
		reference?: string;
		_type: 'epigraph';
		_key: string;
	}>;
	body?: BlockContent;
	review?: BlockContent;
	originalPublication: string;
};

export type Author = {
	_id: string;
	_type: 'author';
	_createdAt: string;
	_updatedAt: string;
	_rev: string;
	name: string;
	slug: Slug;
	image: ImageQueryResult;
	nationality: {
		_ref: string;
		_type: 'reference';
		_weak?: boolean;
		[internalGroqTypeReferenceTo]?: 'nationality';
	};
	biography: {
		es?: BlockContent;
		en?: BlockContent;
	};
	resources?: Array<{
		title: string;
		url: string;
		resourceType: {
			_ref: string;
			_type: 'reference';
			_weak?: boolean;
			[internalGroqTypeReferenceTo]?: 'resourceType';
		};
		_type: 'resource';
		_key: string;
	}>;
};

export type ResourceType = {
	_id: string;
	_type: 'resourceType';
	_createdAt: string;
	_updatedAt: string;
	_rev: string;
	title: string;
	slug: Slug;
	description: string;
	icon: IconPicker;
};

export type Nationality = {
	_id: string;
	_type: 'nationality';
	_createdAt: string;
	_updatedAt: string;
	_rev: string;
	country: string;
	flag: ImageQueryResult;
};

export type Slug = {
	_type: 'slug';
	current: string;
	source?: string;
};

export type BlockContent = Array<
	| {
			children?: Array<{
				marks?: Array<string>;
				text?: string;
				_type: 'span';
				_key: string;
			}>;
			style?: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote';
			listItem?: 'bullet' | 'number';
			markDefs?: Array<{
				href?: string;
				_type: 'link';
				_key: string;
			}>;
			level?: number;
			_type: 'block';
			_key: string;
	  }
	| {
			asset?: {
				_ref: string;
				_type: 'reference';
				_weak?: boolean;
				[internalGroqTypeReferenceTo]?: 'sanity.imageAsset';
			};
			hotspot?: SanityImageHotspot;
			crop?: SanityImageCrop;
			_type: 'image';
			_key: string;
	  }
>;

export type SanityImageCrop = {
	_type: 'sanity.imageCrop';
	top?: number;
	bottom?: number;
	left?: number;
	right?: number;
};

export type SanityImageHotspot = {
	_type: 'sanity.imageHotspot';
	x?: number;
	y?: number;
	height?: number;
	width?: number;
};

export type SanityImageAsset = {
	_id: string;
	_type: 'sanity.imageAsset';
	_createdAt: string;
	_updatedAt: string;
	_rev: string;
	originalFilename?: string;
	label?: string;
	title?: string;
	description?: string;
	altText?: string;
	sha1hash?: string;
	extension?: string;
	mimeType?: string;
	size?: number;
	assetId?: string;
	uploadId?: string;
	path?: string;
	url?: string;
	metadata?: SanityImageMetadata;
	source?: SanityAssetSourceData;
};

export type SanityAssetSourceData = {
	_type: 'sanity.assetSourceData';
	name?: string;
	id?: string;
	url?: string;
};

export type SanityImageMetadata = {
	_type: 'sanity.imageMetadata';
	location?: Geopoint;
	dimensions?: SanityImageDimensions;
	palette?: SanityImagePalette;
	lqip?: string;
	blurHash?: string;
	hasAlpha?: boolean;
	isOpaque?: boolean;
};

export type IconPicker = {
	_type: 'iconPicker';
	provider?: string;
	name?: string;
	svg?: string;
};

export type ComputedNumber = number;

export type ComputedText = string;

export type ComputedString = string;

export type ComputedBoolean = boolean;

export type AllSanitySchemaTypes =
	| SanityImagePaletteSwatch
	| SanityImagePalette
	| SanityImageDimensions
	| SanityFileAsset
	| Geopoint
	| Tag
	| Storylist
	| LandingPage
	| Resource
	| Publication
	| Story
	| Author
	| ResourceType
	| Nationality
	| Slug
	| BlockContent
	| SanityImageCrop
	| SanityImageHotspot
	| SanityImageAsset
	| SanityAssetSourceData
	| SanityImageMetadata
	| IconPicker
	| ComputedNumber
	| ComputedText
	| ComputedString
	| ComputedBoolean;
export declare const internalGroqTypeReferenceTo: unique symbol;
