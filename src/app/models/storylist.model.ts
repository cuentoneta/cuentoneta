import { Story, StoryBase, StoryDTO } from './story.model';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

interface StorylistBase {
  title: string;
  slug: string;
  displayDates: boolean;
  editionPrefix: string;
  count: number;
  comingNextLabel: string;
  description?: string[];
  language?: string;
  featuredImage?: SanityImageSource;
  images?: {
    slug: string;
    url: SanityImageSource;
  }[];
  previewImages?: {
    slug: string;
    url: SanityImageSource;
  }[];
  gridConfig?: StorylistGridConfig;
  previewGridConfig?: StorylistGridConfig;
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

export interface StorylistGridConfig {
  gridTemplateColumns: string;
  titlePlacement: GridItemPlacementConfig;
  cardsPlacement: GridItemPlacementConfig[];
}

export interface GridItemPlacementConfig {
  slug?: string;
  imageSlug?: string;
  order: number;
  startCol?: number | string;
  endCol?: number | string;
  startRow?: number | string;
  endRow?: number | string;
}
