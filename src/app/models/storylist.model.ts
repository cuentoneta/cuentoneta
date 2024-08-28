import { StoryBase, StoryPreview } from './story.model';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { Tag } from '@models/tag.model';
import { TextBlockContent } from '@models/block-content.model';

interface StorylistBase {
	title: string;
	slug: string;
	displayDates: boolean;
	editionPrefix: string;
	count: number;
	comingNextLabel: string;
	description: TextBlockContent[];
	language: string;
	featuredImage: SanityImageSource;
	tags: Tag[];
}

export type StorylistTeaser = StorylistBase;

export interface Storylist extends StorylistBase {
	publications: Publication<StoryPreview>[];
}

export interface Publication<T extends StoryBase> {
	publishingOrder: number;
	published: boolean;
	publishingDate?: string;
	story: T;
}
