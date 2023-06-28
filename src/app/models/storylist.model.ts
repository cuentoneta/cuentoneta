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

export interface Storylist extends StorylistBase {
  publications: Publication<Story>[];
}

export interface StorylistDTO extends StorylistBase {
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
  order: number;
  // ToDo: Adaptar estos tipos a la última versión de API de Sanity
  slug?: string | null;
  imageSlug?: string | null;
  startCol?: number | string | null;
  endCol?: number | string | null;
  startRow?: number | string | null;
  endRow?: number | string | null;
}
