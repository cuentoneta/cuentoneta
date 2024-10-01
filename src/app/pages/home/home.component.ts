// Core
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, isPlatformBrowser, NgOptimizedImage } from '@angular/common';

// 3rd party modules
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

// Routing
import { RouterModule } from '@angular/router';
import { AppRoutes } from '../../app.routes';

// Services
import { ContentService } from '../../providers/content.service';
import { ThemeService } from '../../providers/theme.service';

// Models
import { StorylistTeaser } from '@models/storylist.model';

// Directives
import { FetchContentDirective } from '../../directives/fetch-content.directive';
import { MetaTagsDirective } from '../../directives/meta-tags.directive';

// Componentes
import { PublicationCardComponent } from '../../components/publication-card/publication-card.component';
import { StorylistCardDeckComponent } from 'src/app/components/storylist-card-deck/storylist-card-deck.component';
import { StorylistCardComponent } from '../../components/storylist-card-component/storylist-card.component';
import { ContentCampaignCarouselComponent } from '../../components/content-campaign-carousel/content-campaign-carousel.component';

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
		NgxSkeletonLoaderModule,
		ContentCampaignCarouselComponent,
	],
	hostDirectives: [FetchContentDirective, MetaTagsDirective],
})
export class HomeComponent {
	readonly appRoutes = AppRoutes;

	// Services
	private contentService = inject(ContentService);
	private themeService = inject(ThemeService);

	// Directives
	private fetchContentDirective = inject(FetchContentDirective);
	private metaTagsDirective = inject(MetaTagsDirective);

	cards: StorylistTeaser[] = [];
	slides$ = this.contentService.getContentCampaigns$();
	skeletonColor = this.themeService.pickColor('zinc', 300);

	constructor() {
		// Asignación inicial para dibujar skeletons
		this.cards = [];
		this.metaTagsDirective.setDefault();

		const platformId = inject(PLATFORM_ID);
		if (!isPlatformBrowser(platformId)) {
			return;
		}

		// En cliente-side, posteriormente, se cargan los decks con las historias, según la configuración de contenido
		this.loadStorylistDecks();
	}

	private loadStorylistDecks() {
		this.fetchContentDirective
			.fetchContent$<{ cards: StorylistTeaser[] }>(this.contentService.getLandingPageContent())
			.pipe(takeUntilDestroyed())
			.subscribe(({ cards }) => {
				this.cards = cards;
			});
	}
}
