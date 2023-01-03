export interface StoryModel {
    id: number;
    author: Author;
    title: string;
    day: number;
    prologues: Prologue[];
    summary: string[];
    paragraphs: string[];
    edition: string;
}

export interface Prologue {
    text: string;
    reference: string;
}

export interface Author {
    id: number;
    name: string;
    imageUrl: string;
    nationality: string;
    biography: string;
    fullBioUrl: string;
}
