export interface StoryModel {
    id: number;
    author: Author;
    title: string;
    day: number;
    prologues: Prologue[];
    summary: string[];
    paragraphs: Paragraph[];
}

export interface Paragraph {
    text: string;
    bold?: boolean;
    italics?: boolean;
}
export interface Prologue {
    text: string;
    reference: string;
}

export interface Author {
    id: number;
    name: string;
    imgString: string;
    nationality: string;
    biography: string[];
    fullBioUrl: string;
}
