import { GridItemPlacementConfig, StoryList } from './storylist.model';

export interface StorylistDeckConfig {
    title: string;
    slug: string;
    ordering: 'asc' | 'desc' | undefined;
    gridTemplateColumns: string;
    amount: number;
    titlePlacement: GridItemPlacementConfig,
    cardsPlacement: GridItemPlacementConfig[];
}

export interface StorylistCardDeck extends StorylistDeckConfig {
    storylist?: StoryList;
}
