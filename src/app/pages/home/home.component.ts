// Core
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  CommonModule,
  isPlatformBrowser,
  NgOptimizedImage,
} from '@angular/common';

// Services
import { ContentService } from '../../providers/content.service';

// Models
import { StorylistCardDeck } from '@models/content.model';

// Directives
import { FetchContentDirective } from '../../directives/fetch-content.directive';
import { APP_ROUTE_TREE } from '../../app.routes';
import { StoryCardComponent } from 'src/app/components/story-card/story-card.component';
import { StorylistCardDeckComponent } from 'src/app/components/storylist-card-deck/storylist-card-deck.component';
import { RouterModule } from '@angular/router';
import { StorylistCardComponent } from '../../components/storylist-card-component/storylist-card.component';

@Component({
  selector: 'cuentoneta-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    StoryCardComponent,
    StorylistCardDeckComponent,
    RouterModule,
    StorylistCardComponent,
  ],
  hostDirectives: [FetchContentDirective],
})
export class HomeComponent {
  readonly appRouteTree = APP_ROUTE_TREE;

  storylistCardDecks: StorylistCardDeck[] = [];

  // Services
  public fetchContentDirective = inject(
    FetchContentDirective<StorylistCardDeck[]>
  );
  private contentService = inject(ContentService);

  constructor() {
    // Asignación inicial para dibujar skeletons
    this.storylistCardDecks = this.contentService.contentConfig;

    const platformId = inject(PLATFORM_ID);
    if (!isPlatformBrowser(platformId)) {
      return;
    }

    // En cliente-side, posteriormente, se cargan los decks con las historias, según la configuración de contenido
    this.loadStorylistDecks();
  }

  private loadStorylistDecks() {
    this.fetchContentDirective
      .fetchContent$(this.contentService.fetchStorylistDecks())
      .pipe(takeUntilDestroyed())
      .subscribe((result) => {
        this.storylistCardDecks = result;
      });
  }
}
