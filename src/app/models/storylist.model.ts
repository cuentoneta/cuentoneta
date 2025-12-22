import { StoryNavigationTeaserWithAuthor, StoryTeaserWithAuthor } from './story.model';
import { Tag } from '@models/tag.model';
import { TextBlockContent } from '@models/block-content.model';
import { Media } from '@models/media.model';

export interface StorylistTab {
	title: string;
	slug: string;
	content: TextBlockContent[];
	icon?: string;
}

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
	tabs: StorylistTab[];
	media: Media[];
}

export interface StorylistTeaser extends StorylistBase<never> {
	stories: Array<never>;
	tabs: Array<never>;
}

export interface StorylistStoriesNavigationTeasers extends StorylistBase<StoryNavigationTeaserWithAuthor> {
	stories: StoryNavigationTeaserWithAuthor[];
	tabs: Array<never>;
	media: Array<never>;
}

export interface Storylist extends StorylistBase<StoryTeaserWithAuthor> {
	stories: StoryTeaserWithAuthor[];
}
