// Core
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, isPlatformBrowser, NgOptimizedImage } from '@angular/common';

// Services
import { ContentService } from '../../providers/content.service';

// Models
import { StorylistCardDeck } from '@models/content.model';

// Directives
import { FetchContentDirective } from '../../directives/fetch-content.directive';
import { AppRoutes } from '../../app.routes';
import { PublicationCardComponent } from '../../components/publication-card/publication-card.component';
import { StorylistCardDeckComponent } from 'src/app/components/storylist-card-deck/storylist-card-deck.component';
import { RouterModule } from '@angular/router';
import { StorylistCardComponent } from '../../components/storylist-card-component/storylist-card.component';

@Component({
	selector: 'cuentoneta-home',
	templateUrl: './home.component.html',
	standalone: true,
	imports: [
		CommonModule,
		NgOptimizedImage,
		PublicationCardComponent,
		StorylistCardDeckComponent,
		RouterModule,
		StorylistCardComponent,
	],
	hostDirectives: [FetchContentDirective],
})
export class HomeComponent {
	readonly appRoutes = AppRoutes;

	cards: StorylistCardDeck[] = [];
	previews: StorylistCardDeck[] = [];

	// Services
	public fetchContentDirective = inject(FetchContentDirective);
	private contentService = inject(ContentService);

	constructor() {
		// Asignación inicial para dibujar skeletons
		this.cards = this.contentService.contentConfig.cards;
		this.previews = this.contentService.contentConfig.previews;

		const platformId = inject(PLATFORM_ID);
		if (!isPlatformBrowser(platformId)) {
			return;
		}

		// En cliente-side, posteriormente, se cargan los decks con las historias, según la configuración de contenido
		this.loadStorylistDecks();
	}

	private loadStorylistDecks() {
		this.fetchContentDirective
			.fetchContent$<{ previews: StorylistCardDeck[]; cards: StorylistCardDeck[] }>(
				this.contentService.fetchStorylistDecks(),
			)
			.pipe(takeUntilDestroyed())
			.subscribe(({ previews, cards }) => {
				this.previews = previews;
				this.cards = cards;
			});
	}
}
