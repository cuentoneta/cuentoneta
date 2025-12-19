import { StoryNavigationTeaserWithAuthor, StoryTeaserWithAuthor } from './story.model';
import { Tag } from '@models/tag.model';
import { TextBlockContent } from '@models/block-content.model';

interface StorylistBase<T> {
	_id: string;
	title: string;
	slug: string;
	count: number;
	description: TextBlockContent[];
	featuredImage: string;
	tags: Tag[];
	stories: T[];
	config: {
		showAuthors: boolean;
	};
}

export interface StorylistTeaser extends StorylistBase<never> {
	stories: Array<never>;
}

export interface StorylistStoriesNavigationTeasers extends StorylistBase<StoryNavigationTeaserWithAuthor> {
	stories: StoryNavigationTeaserWithAuthor[];
}

export interface Storylist extends StorylistBase<StoryTeaserWithAuthor> {
	stories: StoryTeaserWithAuthor[];
}
