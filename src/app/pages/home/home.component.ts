// Core
import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

// Services
import { ContentService } from '../../providers/content.service';

// Directives
import { MetaTagsDirective } from '../../directives/meta-tags.directive';

// Componentes
import { ContentCampaignCarouselComponent } from '../../components/content-campaign-carousel/content-campaign-carousel.component';
import { StorylistCardComponent } from '../../components/storylist-card-component/storylist-card.component';
import { ContentCampaignCarouselSkeletonComponent } from '../../components/content-campaign-carousel/content-campaign-carousel-skeleton.component';
import { StorylistCardSkeletonComponent } from '../../components/storylist-card-component/storylist-card-skeleton.component';
import { MostReadStoriesCardDeckComponent } from '../../components/most-read-stories-card-deck/most-read-stories-card-deck.component';

@Component({
	selector: 'cuentoneta-home',
	templateUrl: './home.component.html',
	imports: [
		CommonModule,
		ContentCampaignCarouselComponent,
		StorylistCardComponent,
		ContentCampaignCarouselSkeletonComponent,
		StorylistCardSkeletonComponent,
		MostReadStoriesCardDeckComponent,
	],
	hostDirectives: [MetaTagsDirective],
})
export default class HomeComponent {
	// Services
	private contentService = inject(ContentService);

	// Directives
	private metaTagsDirective = inject(MetaTagsDirective);

	// Recursos
	readonly landingPageResource = rxResource({
		loader: () => this.contentService.getLandingPageContent(),
	});

	// Propiedades
	landingPageContent = computed(() => this.landingPageResource.value());
	cards = computed(() => this.landingPageContent()?.cards || []);
	campaigns = computed(() => this.landingPageContent()?.campaigns || []);
	mostRead = computed(() => this.landingPageContent()?.mostRead.slice(0, 6) || []);

	constructor() {
		this.metaTagsDirective.setDefault();
	}
}
