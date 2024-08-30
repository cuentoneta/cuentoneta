import { StoryBase } from './story.model';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { Tag } from '@models/tag.model';
import { TextBlockContent } from '@models/block-content.model';

export interface StorylistBase {
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

export interface StorylistTeaser extends StorylistBase {
	featuredImage: string;
	publications: [];
}

export interface Storylist<T extends StoryBase, K extends PublicationBase<T>> extends StorylistBase {
	featuredImage: string;
	publications: K[];
}

export interface PublicationBase<T extends StoryBase> {
	publishingOrder: number;
	published: boolean;
	publishingDate?: string;
	story: T;
}

export interface Publication<T extends StoryBase> extends PublicationBase<T> {
	editionLabel: string;
	comingNextLabel: string;
}
