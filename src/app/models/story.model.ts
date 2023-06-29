import { Author } from './author.model';
import { Prologue } from './prologue.model';

export interface StoryBase {
    id: number;
    title: string;
    slug: string;
    approximateReadingTime: number;
    author: Author;
    originalLink?: string;
}

export interface Story extends StoryBase {
    prologues: Prologue[];
    summary: string;
    paragraphs: string[];
}

// ToDo: Agregar tipo BlockContent para tratar datos de texto que vienen desde Sanity (#114)
export interface StoryDTO extends StoryBase {
    prologues: any[];
    summary: any[];
    paragraphs: any[];
}

export interface StoryCard extends Story {
    author: Omit<Author, 'biography'>;
}
