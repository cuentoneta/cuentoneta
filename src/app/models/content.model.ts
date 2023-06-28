import { GridItemPlacementConfig, Storylist } from './storylist.model';

export interface StorylistDeckConfig {
    title: string;
    slug: string;
    ordering: 'asc' | 'desc' | undefined;
    amount: number;
    previewGridSkeletonConfig: StorylistGridSkeletonConfig;
    gridSkeletonConfig: StorylistGridSkeletonConfig;
}

export interface StorylistCardDeck extends StorylistDeckConfig {
    storylist?: Storylist;
}

export interface StorylistGridSkeletonConfig {
    gridTemplateColumns: string;
    titlePlacement: GridItemPlacementConfig,
    cardsPlacement: GridItemPlacementConfig[];
}
