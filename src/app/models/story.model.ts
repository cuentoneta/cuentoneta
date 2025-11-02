import { Author, AuthorTeaser } from './author.model';
import { TextBlockContent } from '@models/block-content.model';
import { Media } from '@models/media.model';
import { Resource } from '@models/resource.model';

interface StoryBase {
	_id: string;
	title: string;
	slug: string;
	approximateReadingTime: number;
	badLanguage?: boolean;
	language: string;
	resources: Resource[];
	paragraphs: TextBlockContent[];
	media: Media[];
	originalPublication: string;
}

export interface Epigraph {
	text: TextBlockContent[];
	reference: TextBlockContent[];
}

export interface Story extends StoryBase {
	author: Author;
	epigraphs: Epigraph[];
	summary: TextBlockContent[];
}

export interface StoryNavigationTeaser extends StoryBase {
	paragraphs: Array<never>;
}

export interface StoryNavigationTeaserWithAuthor extends StoryBase {
	author: AuthorTeaser;
	paragraphs: Array<never>;
}

export type StoryTeaser = StoryBase;

export interface StoryTeaserWithAuthor extends StoryTeaser {
	author: AuthorTeaser;
}

/**
 * @deprecated Reemplazar uso por interfaces StoryTeaser, StoryNavigationTeaser o StoryNavigationTeaserWithAuthor
 */
export interface StoryPreview extends StoryBase {
	author: AuthorTeaser;
}
