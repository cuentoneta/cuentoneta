import { Story, StoryBase, StoryDTO } from './story.model';

interface StorylistBase {
    title: string;
    slug: string;
    editionPrefix: string;
    count: number;
    description?: string[];
    language?: string;
    imageUrl?: string;
}
export interface StoryList extends StorylistBase {
    publications: Publication<Story>[];
}
export interface StoryListDTO extends StorylistBase {
    publications: Publication<StoryDTO>[];
}

export interface Publication<T extends StoryBase> {
    order: number;
    published: boolean;
    publishingDate?: string;
    story: T;
}
