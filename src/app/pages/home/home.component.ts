// Core
import { Component, computed, inject } from '@angular/core';

// Services
import { ContentApi } from '../../providers/content.provider';

// Utils
import { ssrBlockingRxResource } from '@app-utils/ssr-resource';
import { AppRoutes } from '../../app.routes';

// SEO
import { HomeMetaTagsDirective } from './home-meta-tags.directive';
import { HomeStructuredDataDirective } from './home-structured-data.directive';

// Componentes
import { CarouselComponent } from '@components/carousel/carousel.component';
import { HomeHeroComponent } from '@components/home-hero/home-hero.component';
import { LiteraryWorksCardDeck } from '@components/literary-works-card-deck/literary-works-card-deck';
import { CarouselSkeletonComponent } from '@components/carousel/carousel-skeleton.component';
import { CollectionTeasersDeck } from '@components/collection-teasers-deck/collection-teasers-deck';
import { HighlightedAuthorsComponent } from '@components/highlighted-authors/highlighted-authors.component';
import { SectionHeaderComponent, type SectionHeaderAction } from '@components/section-header/section-header.component';

@Component({
	selector: 'cuentoneta-home',
	templateUrl: './home.component.html',
	imports: [
		CarouselComponent,
		HomeHeroComponent,
		LiteraryWorksCardDeck,
		CarouselSkeletonComponent,
		CollectionTeasersDeck,
		HighlightedAuthorsComponent,
		SectionHeaderComponent,
	],
	hostDirectives: [HomeMetaTagsDirective, HomeStructuredDataDirective],
})
export default class HomeComponent {
	// Services
	private readonly contentService = inject(ContentApi);

	// Las dos secciones de obras comparten destino porque comparten hub: no hay una vista filtrada de
	// novedades ni de más leídas a la que llevar.
	protected readonly literaryWorksAction: SectionHeaderAction = {
		link: ['/', AppRoutes.LiteraryWork],
		accessibleSuffix: 'el catálogo de obras',
	};

	// Recursos
	private readonly landingPageResource = ssrBlockingRxResource({
		stream: () => this.contentService.getLandingPageContent(),
		defaultValue: undefined,
	});

	// Propiedades
	private readonly landingPageContent = computed(() => this.landingPageResource.value());
	protected readonly collections = computed(() => this.landingPageContent()?.collections || []);
	protected readonly campaigns = computed(() => this.landingPageContent()?.campaigns || []);
	protected readonly mostRead = computed(() => this.landingPageContent()?.mostRead.slice(0, 6) || []);
	protected readonly latestReads = computed(() => this.landingPageContent()?.latestReads.slice(0, 6) || []);
	protected readonly highlightedAuthors = computed(() => this.landingPageContent()?.highlightedAuthors ?? []);

	// Solo las colecciones con portada editorial propia: las que caen en `sample` prestan las portadas de
	// sus obras, y esas ya se ven más abajo en la página. Sin ninguna, la banda va sin portadas.
	protected readonly heroCovers = computed(() =>
		this.collections()
			.flatMap((collection) => (collection.imagery.kind === 'representative' ? [collection.imagery.image] : []))
			.slice(0, 3),
	);
}
