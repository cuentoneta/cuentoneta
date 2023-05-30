// Core
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { RouterLink } from '@angular/router';

// Modules
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { CommonModule } from '@angular/common';
import { StoryCardModule } from '../story-card/story-card.module';

// Models
import {
  GridItemPlacementConfig,
  StoryList,
} from '../../models/storylist.model';
import { APP_ROUTE_TREE } from '../../app-routing.module';
import {StorylistDeckConfig} from "../../models/content.model";

@Component({
  selector: 'cuentoneta-story-list-card-deck',
  standalone: true,
  imports: [CommonModule, StoryCardModule, RouterLink, NgxSkeletonLoaderModule],
  templateUrl: './story-list-card-deck.component.html',
  styleUrls: ['./story-list-card-deck.component.scss'],
})
export class StoryListCardDeckComponent implements OnInit, OnChanges {
  @Input() number: number = 6;
  @Input() storylist: StoryList | undefined;
  @Input() isLoading: boolean = false; // Utilizado para mostrar/ocultar skeletons
  @Input() displayTitle: boolean = true;
  @Input() displayFeaturedImage: boolean = false;
  @Input() skeletonConfig: StorylistDeckConfig | undefined

  dummyList: null[] = [];
  imagesCardConfig: { [key: string]: CardDeckCSSGridConfig } = {};
  storiesCardConfig: { [key: string]: CardDeckCSSGridConfig } = {};
  readonly appRouteTree = APP_ROUTE_TREE;

  ngOnInit() {
    this.dummyList = Array(this.number);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!!changes['storylist'] && !!changes['storylist'].currentValue) {
      this.generateStoriesCardConfig();
      this.generateImagesCardConfig();
    }
  }

  private generateImagesCardConfig() {
    const cardsPlacement: GridItemPlacementConfig[] =
      this.storylist!.gridConfig!.cardsPlacement;
    const parsedConfigs = cardsPlacement
      .filter((card) => !!card.imageSlug)
      .map((card) => ({
        slug: card.imageSlug,
        ...this.generateCardConfig(card.imageSlug!),
      }));
    for (const config of parsedConfigs) {
      const { slug, ...other } = config;
      this.imagesCardConfig[config.slug!] = other;
    }
  }

  private generateStoriesCardConfig() {
    const cardsPlacement: GridItemPlacementConfig[] =
      this.storylist!.gridConfig!.cardsPlacement;
    const parsedConfigs = cardsPlacement
      .filter((card) => !!card.slug)
      .map((card) => ({
        slug: card.slug,
        ...this.generateCardConfig(card.slug!),
      }));
    for (const config of parsedConfigs) {
      const { slug, ...other } = config;
      this.storiesCardConfig[config.slug!] = other;
    }
  }

  private generateCardConfig(slug: string): CardDeckCSSGridConfig {
    const storyCardConfig = this.storylist?.gridConfig?.cardsPlacement?.find(
      (card) => [card.slug, card.imageSlug].includes(slug)
    );
    return {
      order: storyCardConfig?.order! ?? 2,
      'grid-column-start': storyCardConfig?.startCol ?? 'auto',
      'grid-column-end': storyCardConfig?.endCol ?? 'span 4',
    };
  }
}

interface CardDeckCSSGridConfig {
  order: number;
  'grid-column-start': string | number;
  'grid-column-end': string | number;
  'grid-row-start'?: string | number;
  'grid-row-end'?: string | number;
}
