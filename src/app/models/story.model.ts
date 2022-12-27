import { Author } from './author.model';
import { Prologue } from './prologue.model';

export interface Story {
    id: number;
    author: Author;
    title: string;
    day: number;
    prologues: Prologue[];
    summary: string;
    paragraphs: string[];
}