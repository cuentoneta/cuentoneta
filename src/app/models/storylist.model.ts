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

// Representación visual de una colección en su teaser: la portada editorial propia (`representative`) o, en su
// ausencia, una muestra de 3 portadas de sus historias (`sample`), con '' en los slots sin historia.
export type StorylistImagery =
	| { kind: 'representative'; image: string }
	| { kind: 'sample'; images: [string, string, string] };

export interface StorylistTeaser extends Omit<StorylistBase<never>, 'featuredImage'> {
	stories: Array<never>;
	tabs: Array<never>;
	imagery: StorylistImagery;
}

export interface StorylistStoriesNavigationTeasers extends StorylistBase<StoryNavigationTeaserWithAuthor> {
	stories: StoryNavigationTeaserWithAuthor[];
	tabs: Array<never>;
	media: Array<never>;
}

export interface Storylist extends StorylistBase<StoryTeaserWithAuthor> {
	stories: StoryTeaserWithAuthor[];
}
