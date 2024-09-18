import { Author, AuthorTeaser } from './author.model';
import { TextBlockContent } from '@models/block-content.model';
import { Media } from '@models/media.model';
import { Resource } from '@models/resource.model';

interface StoryBase {
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

export interface StoryTeaser extends StoryBase {
	paragraphs: [TextBlockContent, TextBlockContent, TextBlockContent];
}

export interface StoryPreview extends StoryBase {
	author: AuthorTeaser;
}
