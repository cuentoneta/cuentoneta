import { Story, StoryDTO } from './story.model';

interface StoryListBase {
    title: string;
    slug: string;
    description?: string[];
    language?: string;
    imageUrl?: string;
}
export interface StoryList extends StoryListBase {
    stories: Story[];
}
export interface StoryListDTO extends StoryListBase {
    stories: StoryDTO[];
}
