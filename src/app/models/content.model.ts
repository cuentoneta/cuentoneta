import { StoryList } from './storylist.model';

export interface ContentConfig {
    storylistDeckConfigs: StorylistDeckConfig[];
}

export interface StorylistDeckConfig {
    title: string;
    slug: string;
    highlightFirstRow: boolean;
    amount: number;
}

export interface StorylistCardDeck extends StorylistDeckConfig {
    storylist?: StoryList;
}
