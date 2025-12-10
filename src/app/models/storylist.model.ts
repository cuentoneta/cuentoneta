import { StoryNavigationTeaserWithAuthor, StoryTeaserWithAuthor } from './story.model';
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
	featuredImage: string;
	tags: Tag[];
	publications: T[];
}

export interface StorylistTeaser extends StorylistBase<never> {
	publications: Array<never>;
}

export interface StorylistPublicationsNavigationTeasers extends StorylistBase<PublicationNavigationTeaser> {
	publications: PublicationNavigationTeaser[];
}

export interface Storylist extends StorylistBase<PublicationTeaserWithAuthor> {
	publications: PublicationTeaserWithAuthor[];
}

export interface PublicationTeaserWithAuthor {
	publishingOrder: number;
	published: boolean;
	publishingDate?: string;
	story: StoryTeaserWithAuthor;
}

export interface PublicationNavigationTeaser {
	publishingOrder: number;
	published: boolean;
	publishingDate?: string;
	story: StoryNavigationTeaserWithAuthor;
}
