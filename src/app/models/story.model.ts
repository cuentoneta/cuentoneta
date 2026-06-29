import { Author, AuthorTeaser } from './author.model';
import { TextBlockContent } from '@models/block-content.model';
import { Media } from '@models/media.model';
import { Resource } from '@models/resource.model';
import { Tag } from '@models/tag.model';

interface StoryBase {
	_id: string;
	title: string;
	slug: string;
	approximateReadingTime: number;
	badLanguage?: boolean;
	// URL de la portada de la historia; '' si no fue asignada (los consumidores muestran placeholder).
	coverImage: string;
	resources: Resource[];
	tags: Tag[];
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
	publishedAt: string;
	updatedAt: string;
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
