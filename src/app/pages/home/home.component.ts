// Core
import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

// Services
import { ContentApi } from '../../providers/content-api.interface';

// Directives
import { MetaTagsDirective } from '../../directives/meta-tags.directive';

// Environment
import { environment } from '../../environments/environment';

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
	hostDirectives: [MetaTagsDirective],
})
export default class HomeComponent {
	// Services
	private contentService = inject(ContentApi);

	// Directives
	private metaTagsDirective = inject(MetaTagsDirective);

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

	constructor() {
		this.updateMetaTags();
	}

	private updateMetaTags() {
		// Title descriptivo (keyword + marca). Se pasa `addPrefix = false` para que el string completo
		// —marca incluida— se emita tal cual en el SSR, donde el sufijo "| La Cuentoneta" no se agrega.
		this.metaTagsDirective.setTitle('Cuentos y relatos breves para leer en línea | La Cuentoneta', false);
		this.metaTagsDirective.setDefaultDescription();
		// Keywords específicas de la home (relevantes y alineadas al título/posicionamiento).
		this.metaTagsDirective.setKeywords([
			'cuentos',
			'relatos breves',
			'literatura',
			'poemas',
			'narraciones',
			'lectura digital',
			'cuentos para leer',
			'literatura breve',
			'colecciones de cuentos',
			'leer en línea',
		]);
		this.metaTagsDirective.setCanonicalUrl(`${environment.website}`);
		this.metaTagsDirective.setRobots('index, follow');
	}
}
