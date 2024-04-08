import { Author, AuthorDTO } from './author.model';
import { Prologue, PrologueDTO } from './prologue.model';
import { BlockContent } from '@models/block-content.model';
import { Media, MediaTypes } from '@models/media.model'
import { Resource } from '@models/resource.model'

export interface StoryBase {
	id: number;
	title: string;
	slug: string;
	approximateReadingTime: number;
	videoUrl?: string;
	badLanguage?: boolean;
	language: string;
	resources?: Resource[]
	paragraphs: unknown
}

export interface Story extends StoryBase {
	author: Author;
	prologues: Prologue[];
	summary: Paragraph[];
	paragraphs: BlockContent[];
	media: MediaTypes[];
}

export interface StoryDTO extends StoryBase {
	author: AuthorDTO;
	prologues: PrologueDTO[];
	summary?: BlockContent[];
	paragraphs: BlockContent[];
	media: Media[];
}

export interface Paragraph {
	classes: string;
	text: string;
}

export interface StoryCard extends Story {
	author: Omit<Author, 'biography'>;
}
