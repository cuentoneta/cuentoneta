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

// Si la colección tiene portada editorial propia se usa (`representative`); en caso contrario, las primeras
// portadas de sus historias (`sample`).
export type StorylistImagery =
	| { readonly kind: 'representative'; readonly image: string }
	| { readonly kind: 'sample'; readonly images: readonly [string, string, string] };

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
