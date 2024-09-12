import { StoryPreview, StoryTeaser } from './story.model';
import { Tag } from '@models/tag.model';
import { TextBlockContent } from '@models/block-content.model';

interface StorylistBase<T> {
	title: string;
	slug: string;
	displayDates: boolean;
	editionPrefix: string;
	count: number;
	comingNextLabel: string;
	description: TextBlockContent[];
	language: string;
	featuredImage: string;
	tags: Tag[];
	publications: T[];
}

export interface StorylistTeaser extends StorylistBase<never> {
	publications: Array<never>;
}

export interface Storylist extends StorylistBase<Publication> {
	publications: Publication[];
}

export interface Publication {
	publishingOrder: number;
	published: boolean;
	publishingDate?: string;
	story: StoryPreview;
}

export interface PublicationTeaser {
	publishingOrder: number;
	published: boolean;
	publishingDate?: string;
	story: StoryTeaser;
}
