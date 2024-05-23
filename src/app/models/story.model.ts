import { Author, AuthorDTO } from './author.model';
import { BlockContent } from '@models/block-content.model';
import { Media } from '@models/media.model';
import { Resource } from '@models/resource.model';
import { Epigraph, EpigraphDTO } from '@models/epigraph.model';

export interface StoryBase {
	id: number;
	title: string;
	slug: string;
	approximateReadingTime: number;
	badLanguage?: boolean;
	language: string;
	resources?: Resource[];
	paragraphs: unknown;
	media: Media[];
}

export interface Story extends StoryBase {
	author: Author;
	epigraphs: Epigraph[];
	summary: BlockContent[];
	paragraphs: BlockContent[];
}

export interface StoryDTO extends StoryBase {
	author: AuthorDTO;
	epigraphs: EpigraphDTO[];
	summary?: BlockContent[];
	paragraphs: BlockContent[];
}

export interface StoryCard extends StoryBase {
	author: Omit<Author, 'biography'>;
	paragraphs: BlockContent[];
}
