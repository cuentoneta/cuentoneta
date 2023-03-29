// Core
import { Component, inject } from '@angular/core';
import { takeUntil } from 'rxjs';

// Interfaces
import { ContentService } from '../../providers/content.service';

// Directives
import { DestroyedDirective } from '../../directives/destroyed.directive';
import { StorylistCardDeck } from '../../models/content.model';

@Component({
    selector: 'cuentoneta-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    hostDirectives: [DestroyedDirective],
})
export class HomeComponent {
    storylistCardDecks: StorylistCardDeck[] = [];

    // Services
    private contentService = inject(ContentService);
    private destroyedDirective = inject(DestroyedDirective);

    constructor() {
        // Asignación inicial para dibujar skeletons
        this.storylistCardDecks = this.contentService.contentConfig.storylistDeckConfigs;
        // Posteriormente se cargan los decks con las historias, según la configuración de contenido
        this.loadStorylistDecks();
    }

    private loadStorylistDecks() {
        this.contentService
            .fetchStorylistDecks()
            .pipe(takeUntil(this.destroyedDirective.destroyed$))
            .subscribe((result) => {
                this.storylistCardDecks = result;
            });
    }
}
