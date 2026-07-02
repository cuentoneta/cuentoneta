// Core
import { Component, computed, input } from '@angular/core';

// Models
import { type LandingPageContent } from '@models/landing-page-content.model';

// SEO
import { HomeMetaTagsDirective } from './home-meta-tags.directive';
import { HomeStructuredDataDirective } from './home-structured-data.directive';

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
	hostDirectives: [HomeMetaTagsDirective, HomeStructuredDataDirective],
})
export default class HomeComponent {
	// Route data
	public readonly landingPageContent = input.required<LandingPageContent>();

	// Propiedades
	protected readonly collections = computed(() => this.landingPageContent().cards);
	protected readonly campaigns = computed(() => this.landingPageContent().campaigns);
	protected readonly mostRead = computed(() => this.landingPageContent().mostRead.slice(0, 6));
	protected readonly latestReads = computed(() => this.landingPageContent().latestReads.slice(0, 6));
}
