import { Author, AuthorDTO } from './author.model';
import { BlockContent } from '@models/block-content.model';
import { Media, MediaTypes } from '@models/media.model';
import { Resource } from '@models/resource.model';
import { Epigraph, EpigraphDTO } from '@models/epigraph.model';

export interface StoryBase {
	id: number;
	title: string;
	slug: string;
	approximateReadingTime: number;
	videoUrl?: string;
	badLanguage?: boolean;
	language: string;
	resources?: Resource[];
	paragraphs: unknown;
}

export interface Story extends StoryBase {
	author: Author;
	epigraphs: Epigraph[];
	summary: BlockContent[];
	paragraphs: BlockContent[];
	media: MediaTypes[];
}

export interface StoryDTO extends StoryBase {
	author: AuthorDTO;
	epigraphs: EpigraphDTO[];
	summary?: BlockContent[];
	paragraphs: BlockContent[];
	media: Media[];
}

export interface StoryCard extends StoryBase {
	author: Omit<Author, 'biography'>;
	paragraphs: BlockContent[];
	media: MediaTypes[];
}
