// Core
import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

// Services
import { ContentApi } from '../../providers/content-api.interface';

// SEO
import { HomeSeoDirective } from './home-seo.directive';

// Componentes
import { CarouselComponent } from '@components/carousel/carousel.component';
import { MostReadStoriesCardDeckComponent } from '@components/most-read-stories-card-deck/most-read-stories-card-deck.component';
import { LatestStoriesCardDeck } from '@components/latest-stories-card-deck/latest-stories-card-deck';
import { CarouselSkeletonComponent } from '@components/carousel/carousel-skeleton.component';
import { CollectionTeasersDeck } from '@components/collection-teasers-deck/collection-teasers-deck';

@Component({
	selector: 'cuentoneta-home',
	templateUrl: './home.component.html',
	imports: [
		CarouselComponent,
		MostReadStoriesCardDeckComponent,
		LatestStoriesCardDeck,
		CarouselSkeletonComponent,
		CollectionTeasersDeck,
	],
	hostDirectives: [HomeSeoDirective],
})
export default class HomeComponent {
	// Services
	private contentService = inject(ContentApi);

	// Recursos
	private readonly landingPageResource = rxResource({
		stream: () => this.contentService.getLandingPageContent(),
		defaultValue: undefined,
	});

	// Propiedades
	private readonly landingPageContent = computed(() => this.landingPageResource.value());
	protected readonly collections = computed(() => this.landingPageContent()?.cards || []);
	protected readonly campaigns = computed(() => this.landingPageContent()?.campaigns || []);
	protected readonly mostRead = computed(() => this.landingPageContent()?.mostRead.slice(0, 6) || []);
	protected readonly latestReads = computed(() => this.landingPageContent()?.latestReads.slice(0, 6) || []);
}
