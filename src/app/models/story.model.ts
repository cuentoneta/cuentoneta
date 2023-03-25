import { Author } from './author.model';
import { Prologue } from './prologue.model';

export interface Story {
    id: number;
    author: Author;
    title: string;
    slug: string;
    prologues: Prologue[];
    summary: string;
    paragraphs: string[];
    publishedAt: string;
    approximateReadingTime: number;
}

// ToDo: Agregar tipo BlockContent para tratar datos de texto que vienen desde Sanity (#114)
export interface StoryDTO {
    id: number;
    author: Author;
    title: string;
    slug: string;
    prologues: any[];
    summary: any[];
    paragraphs: any[];
    publishedAt: string;
    approximateReadingTime: number;
}
