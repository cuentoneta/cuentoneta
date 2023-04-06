// Core
import { Component, inject } from '@angular/core';
import { takeUntil } from 'rxjs';

// Services
import { ContentService } from '../../providers/content.service';

// Models
import { StorylistCardDeck } from '../../models/content.model';

// Directives
import { DestroyedDirective } from '../../directives/destroyed.directive';
import { FetchContentDirective } from '../../directives/fetch-content.directive';

@Component({
    selector: 'cuentoneta-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    hostDirectives: [DestroyedDirective, FetchContentDirective],
})
export class HomeComponent {
    storylistCardDecks: StorylistCardDeck[] = [];

    // Services
    public fetchContentDirective = inject(FetchContentDirective<StorylistCardDeck[]>);
    private contentService = inject(ContentService);
    private destroyedDirective = inject(DestroyedDirective);

    constructor() {
        // Asignación inicial para dibujar skeletons
        this.storylistCardDecks = this.contentService.contentConfig.storylistDeckConfigs;
        // Posteriormente se cargan los decks con las historias, según la configuración de contenido
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
}
