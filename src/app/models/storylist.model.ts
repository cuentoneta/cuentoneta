import { StoryBase, StoryPreview } from './story.model';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { Tag } from '@models/tag.model';

interface StorylistBase {
	title: string;
	slug: string;
	displayDates: boolean;
	editionPrefix: string;
	count: number;
	comingNextLabel: string;
	description?: string[];
	language?: string;
	featuredImage?: SanityImageSource;
	tags: Tag[];
	images?: {
		slug: string;
		url: SanityImageSource;
	}[];
	previewImages?: {
		slug: string;
		url: SanityImageSource;
	}[];
	gridConfig?: StorylistGridConfig;
	previewGridConfig?: StorylistGridConfig;
}

export type StorylistCard = Omit<StorylistBase, 'images' | 'previewImages' | 'gridConfig' | 'previewGridConfig'>;

export interface Storylist extends StorylistBase {
	publications: Publication<StoryPreview>[];
}

export interface StorylistDTO extends StorylistBase {
	publications: Publication<StoryPreview>[];
}

export interface Publication<T extends StoryBase> {
	publishingOrder: number;
	editionLabel: string;
	comingNextLabel: string;
	published: boolean;
	publishingDate?: string;
	story: T;
}

export interface StorylistGridConfig {
	gridTemplateColumns: string;
	titlePlacement: GridItemPlacementConfig;
	cardsPlacement: GridItemPlacementConfig[];
}

export interface GridItemPlacementConfig {
	slug?: string | null;
	order: number;
	imageSlug?: string | null;
	startCol?: string | null;
	endCol?: string | null;
	startRow?: string | null;
	endRow?: string | null;
	publication: Publication<StoryPreview>;
	image: SanityImageSource;
}
