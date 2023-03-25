import { Story, StoryDTO } from './story.model';

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
    stories: Story[];
}
export interface StoryListDTO extends StorylistBase {
    stories: StoryDTO[];
}
