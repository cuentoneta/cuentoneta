// Core
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { takeUntil } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

// Services
import { ContentService } from '../../providers/content.service';

// Models
import { StorylistCardDeck } from '../../models/content.model';

// Directives
import { DestroyedDirective } from '../../directives/destroyed.directive';
import { FetchContentDirective } from '../../directives/fetch-content.directive';
import { APP_ROUTE_TREE } from '../../app-routing.module';

@Component({
    selector: 'cuentoneta-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    hostDirectives: [DestroyedDirective, FetchContentDirective],
})
export class HomeComponent {
    readonly appRouteTree = APP_ROUTE_TREE;

    storylistCardDecks: StorylistCardDeck[] = [];

    // Services
    public fetchContentDirective = inject(FetchContentDirective<StorylistCardDeck[]>);
    private contentService = inject(ContentService);
    private destroyedDirective = inject(DestroyedDirective);

    constructor() {
        // Asignación inicial para dibujar skeletons
        this.storylistCardDecks = this.contentService.contentConfig;

        const platformId = inject(PLATFORM_ID);
        if(!isPlatformBrowser(platformId)) {
            return;
        }

        // En cliente-side, posteriormente, se cargan los decks con las historias, según la configuración de contenido
        this.loadStorylistDecks();
    }

    private loadStorylistDecks() {
        this.fetchContentDirective
            .fetchContent$(this.contentService.fetchStorylistDecks())
            .pipe(takeUntil(this.destroyedDirective.destroyed$))
            .subscribe((result) => {
                this.storylistCardDecks = result;
            });
    }

    protected readonly APP_ROUTE_TREE = APP_ROUTE_TREE;
}
