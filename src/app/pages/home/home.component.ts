// Core
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, isPlatformBrowser } from '@angular/common';

// Services
import { ContentService } from '../../providers/content.service';

// Models
import { ContentCampaign } from '@models/content-campaign.model';
import { LandingPageContent } from '@models/landing-page-content.model';
import { StorylistTeaser } from '@models/storylist.model';

// Directives
import { FetchContentDirective } from '../../directives/fetch-content.directive';
import { MetaTagsDirective } from '../../directives/meta-tags.directive';

// Componentes
import { ContentCampaignCarouselComponent } from '../../components/content-campaign-carousel/content-campaign-carousel.component';
import { StorylistCardComponent } from '../../components/storylist-card-component/storylist-card.component';
import { ContentCampaignCarouselSkeletonComponent } from '../../components/content-campaign-carousel/content-campaign-carousel-skeleton.component';
import { StorylistCardSkeletonComponent } from '../../components/storylist-card-component/storylist-card-skeleton.component';

@Component({
	selector: 'cuentoneta-home',
	templateUrl: './home.component.html',
	standalone: true,
	imports: [
		CommonModule,
		ContentCampaignCarouselComponent,
		StorylistCardComponent,
		ContentCampaignCarouselSkeletonComponent,
		StorylistCardSkeletonComponent,
	],
	hostDirectives: [FetchContentDirective, MetaTagsDirective],
})
export class HomeComponent {
	// Services
	private contentService = inject(ContentService);

	// Directives
	private fetchContentDirective = inject(FetchContentDirective);
	private metaTagsDirective = inject(MetaTagsDirective);

	cards: StorylistTeaser[] = [];
	campaigns: ContentCampaign[] = [];

	constructor() {
		// Asignación inicial para dibujar skeletons
		this.cards = [];
		this.metaTagsDirective.setDefault();

		const platformId = inject(PLATFORM_ID);
		if (!isPlatformBrowser(platformId)) {
			return;
		}

		// En cliente-side, posteriormente, se cargan los decks con las historias y
		// las campañas de contenido, según la configuración
		this.loadLandingPageContent();
	}

	private loadLandingPageContent() {
		this.fetchContentDirective
			.fetchContent$<LandingPageContent>(this.contentService.getLandingPageContent())
			.pipe(takeUntilDestroyed())
			.subscribe(({ cards, campaigns }) => {
				this.cards = cards;
				this.campaigns = campaigns;
			});
	}
}
